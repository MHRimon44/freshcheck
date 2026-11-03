import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const project='demo-freshcheck';
const base=`http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents`;
if(process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Run only through the configured local emulator command.');
async function request(url,method='GET',body,token) {
 return fetch(url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
}
const field=value=>typeof value==='number'?{integerValue:String(value)}:{stringValue:value};
const fields=value=>Object.fromEntries(Object.entries(value).map(([key,value])=>[key,field(value)]));
async function write(path,data,token='owner') {
 return request(`${base}:commit`,'POST',{writes:[{update:{name:`projects/${project}/databases/(default)/documents/${path}`,fields:fields(data)},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}]}]},token);
}
async function account() {
 const response=await request('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key','POST',{email:`qa-${randomUUID()}@example.test`,password:randomUUID(),returnSecureToken:true});
 assert.equal(response.status,200,'Create isolated emulator account');return response.json();
}
async function expectStatus(response,status){assert.equal(response.status,status,await response.text());}
const queryOwner=(owner)=>({structuredQuery:{from:[{collectionId:'foods'}],...(owner?{where:{fieldFilter:{field:{fieldPath:'ownerId'},op:'EQUAL',value:{stringValue:owner}}}}:{})}});
test('Firestore multi-user rules in isolated Auth/Firestore emulators',async t=>{
 const a=await account(),b=await account(),prefix=randomUUID();
 const food={ownerId:a.localId,name:'Grapes',storedDate:'2026-11-03',recommendedDays:7,notes:'Public storage note'};
 const legacy=`foods/${prefix}-legacy`,owned=`foods/${prefix}-owned`;
 await expectStatus(await write(legacy,{name:'Legacy Grapes',storedDate:'2026-11-03',recommendedDays:7}),200);
 await expectStatus(await write(owned,food),200);
 await t.test('anonymous get includes legacy and owned foods',async()=>{for(const path of [legacy,owned])await expectStatus(await request(`${base}/${path}`),200);});
 await t.test('anonymous list denied',async()=>expectStatus(await request(`${base}/foods`),403));
 await t.test('anonymous create denied',async()=>expectStatus(await write(`foods/${prefix}-anon`,food,null),403));
 await t.test('anonymous update and delete denied',async()=>{await expectStatus(await write(owned,food,null),403);await expectStatus(await request(`${base}/${owned}`,'DELETE',undefined),403);});
 await t.test('normal user creates own food without organizer membership',async()=>expectStatus(await write(`foods/${prefix}-new`,food,a.idToken),200));
 await t.test('owner spoofing denied',async()=>expectStatus(await write(`foods/${prefix}-spoof`,{...food,ownerId:b.localId},a.idToken),403));
 await t.test('missing owner and extra privileged fields denied',async()=>{const old={...food};delete old.ownerId;await expectStatus(await write(`foods/${prefix}-no-owner`,old,a.idToken),403);await expectStatus(await write(`foods/${prefix}-role`,{...food,role:'organizer'},a.idToken),403);});
 await t.test('invalid period and client-created timestamp denied',async()=>{await expectStatus(await write(`foods/${prefix}-invalid`,{...food,recommendedDays:0},a.idToken),403);await expectStatus(await request(`${base}/foods/${prefix}-bad-time`,'PATCH',{fields:fields({...food,createdAt:'not-a-timestamp'})},a.idToken),403);});
 await t.test('owner-scoped query allowed; global and other-owner queries denied',async()=>{await expectStatus(await request(`${base}:runQuery`,'POST',queryOwner(a.localId),a.idToken),200);await expectStatus(await request(`${base}:runQuery`,'POST',queryOwner(),a.idToken),403);await expectStatus(await request(`${base}:runQuery`,'POST',queryOwner(b.localId),a.idToken),403);});
 await t.test('other user cannot update/delete',async()=>{await expectStatus(await write(owned,food,b.idToken),403);await expectStatus(await request(`${base}/${owned}`,'DELETE',undefined,b.idToken),403);});
 await t.test('owner update/transfer denied but delete allowed',async()=>{await expectStatus(await write(owned,food,a.idToken),403);await expectStatus(await write(owned,{...food,ownerId:b.localId},a.idToken),403);await expectStatus(await request(`${base}/${owned}`,'DELETE',undefined,a.idToken),200);});
 const profile={uid:a.localId,displayName:'QA user',email:a.email};
 await t.test('own profile create and read allowed',async()=>{await expectStatus(await write(`users/${a.localId}`,profile,a.idToken),200);await expectStatus(await request(`${base}/users/${a.localId}`,'GET',undefined,a.idToken),200);});
 await t.test('profile display name update preserves timestamp',async()=>expectStatus(await request(`${base}/users/${a.localId}?updateMask.fieldPaths=displayName`,'PATCH',{fields:fields({displayName:'Updated name'})},a.idToken),200));
 await t.test('anonymous and other user profile get denied',async()=>{await expectStatus(await request(`${base}/users/${a.localId}`),403);await expectStatus(await request(`${base}/users/${a.localId}`,'GET',undefined,b.idToken),403);});
 await t.test('profile list, cross-user create and privileged field escalation denied',async()=>{await expectStatus(await request(`${base}/users`,'GET',undefined,a.idToken),403);await expectStatus(await write(`users/${b.localId}`,{...profile,uid:b.localId},a.idToken),403);await expectStatus(await request(`${base}/users/${a.localId}?updateMask.fieldPaths=role`,'PATCH',{fields:fields({role:'organizer'})},a.idToken),403);});
 await t.test('profile UID/email/timestamp changes denied',async()=>{for(const patch of [{uid:b.localId},{email:b.email},{createdAt:'changed'}])await expectStatus(await request(`${base}/users/${a.localId}?updateMask.fieldPaths=${Object.keys(patch)[0]}`,'PATCH',{fields:fields(patch)},a.idToken),403);});
 await t.test('normal user cannot create or modify organizer membership',async()=>{await expectStatus(await write(`organizers/${a.localId}`,{enabled:'true'},a.idToken),403);await expectStatus(await write(`organizers/${a.localId}`,{enabled:'true'}),200);await expectStatus(await write(`organizers/${a.localId}`,{enabled:'false'},a.idToken),403);});
 await t.test('organizer cannot mutate or delete an unowned legacy food',async()=>{await expectStatus(await write(legacy,food,a.idToken),403);await expectStatus(await request(`${base}/${legacy}`,'DELETE',undefined,a.idToken),403);});
 await t.test('unrelated collection is default denied',async()=>expectStatus(await write(`private/${prefix}`,{value:'test'},a.idToken),403));
});
