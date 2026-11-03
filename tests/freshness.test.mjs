import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateDay, getDaysStored, getFreshnessStatus, getRemainingDays, localDate, validateFood } from '../src/utils/freshness.ts';
const today = '2026-11-03';
test('seven-day boundary: fresh on day four, soon on day five through seven, check on eight', () => {
 assert.equal(getFreshnessStatus('2026-10-30',7,today),'Fresh');
 assert.equal(getFreshnessStatus('2026-10-29',7,today),'Use Soon');
 assert.equal(getFreshnessStatus('2026-10-27',7,today),'Use Soon');
 assert.equal(getFreshnessStatus('2026-10-26',7,today),'Check Before Use');
});
test('one-day periods and zero remaining days', () => {
 assert.equal(getFreshnessStatus(today,1,today),'Fresh');
 assert.equal(getFreshnessStatus('2026-11-02',1,today),'Use Soon');
 assert.equal(getRemainingDays('2026-11-02',1,today),0);
 assert.equal(getRemainingDays('2026-11-01',1,today),-1);
});
test('calendar arithmetic crosses daylight-saving and year boundaries', () => {
 assert.equal(getDaysStored('2026-10-31',today),3);
 assert.equal(getDaysStored('2025-12-31','2026-01-01'),1);
 assert.equal(getDaysStored('2024-02-28','2024-03-01'),2);
});
test('invalid dates are rejected rather than silently normalized', () => {
 for (const value of ['2026-02-30','2026-13-01','bad','2026-1-03','']) assert.throws(()=>dateDay(value));
});
test('invalid periods fail closed', () => {
 for (const days of [0,-1,1.5,366,NaN,Infinity]) assert.throws(()=>getFreshnessStatus(today,days,today));
});
test('new records reject future dates, blank names, and oversized fields', () => {
 const food={name:'Grapes',storedDate:today,recommendedDays:7};
 assert.doesNotThrow(()=>validateFood(food,today));
 for (const patch of [{storedDate:'2026-11-04'},{name:' '},{name:'a'.repeat(101)},{notes:'a'.repeat(2001)},{recommendedDays:2.5}]) assert.throws(()=>validateFood({...food,...patch},today));
});
test('legacy future dates clamp age to zero; local date uses local calendar fields', () => {
 assert.equal(getDaysStored('2026-11-04',today),0);
 assert.equal(localDate(new Date(2026,10,3,0,5)),'2026-11-03');
});
