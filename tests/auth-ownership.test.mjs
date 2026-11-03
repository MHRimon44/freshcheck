import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, authDestination, authError } from '../src/utils/auth.ts';
import { ownedFoodFields } from '../src/utils/ownership.ts';
test('registration validates names, email, password and confirmation', () => {
 assert.doesNotThrow(()=>validateRegistration(' Sara ','user@example.test','long passphrase','long passphrase'));
 for(const args of [['','user@example.test','abcdefgh','abcdefgh'],['a'.repeat(101),'user@example.test','abcdefgh','abcdefgh'],['Sara','bad','abcdefgh','abcdefgh'],['Sara','user@example.test','short','short'],['Sara','user@example.test','abcdefgh','different']]) assert.throws(()=>validateRegistration(...args));
});
test('auth destinations allow only known protected paths', () => {
 assert.equal(authDestination({from:'/add-food'}),'/add-food');
 for(const state of [null,{}, {from:'https://example.com'},{from:'//example.com'},{from:'/food/id'},{from:'/my-foods'}]) assert.equal(authDestination(state),'/my-foods');
});
test('auth errors provide friendly messages and avoid raw Firebase codes', () => {
 for(const code of ['auth/email-already-in-use','auth/invalid-email','auth/weak-password','auth/invalid-credential','auth/too-many-requests','auth/network-request-failed']) assert.ok(!authError({code}).includes('auth/'));
 assert.equal(authError({code:'auth/unknown'}),"We couldn't complete this account request. Please try again.");
});
test('ownership is sourced from authenticated UID and extra fields cannot spoof it', () => {
 const input={name:' Grapes ',storedDate:'2026-11-03',recommendedDays:7,notes:' chilled ',ownerId:'attacker',role:'organizer'};
 assert.deepEqual(ownedFoodFields(input,'authenticated-user'),{name:'Grapes',storedDate:'2026-11-03',recommendedDays:7,notes:'chilled',ownerId:'authenticated-user'});
 assert.throws(()=>ownedFoodFields(input,''));
});

test('profile destination resumes after sign-in and password change validation rejects mismatches', async () => {
 const { validatePassword } = await import('../src/utils/auth.ts');
 assert.equal(authDestination({from:'/profile'}),'/profile');
 assert.doesNotThrow(()=>validatePassword('long passphrase','long passphrase'));
 assert.throws(()=>validatePassword('short','short'));
 assert.throws(()=>validatePassword('long passphrase','different passphrase'));
});
