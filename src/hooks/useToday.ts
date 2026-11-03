import { useEffect, useState } from 'react';
import { localDate } from '../utils/freshness';
export function useToday() { const [today,setToday] = useState(localDate); useEffect(()=>{ const refresh=()=>setToday(localDate()); const timer=window.setInterval(refresh,30000); window.addEventListener('focus',refresh); return ()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);}; },[]); return today; }
