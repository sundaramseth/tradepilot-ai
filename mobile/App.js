import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
export default function App() {
  const [data,setData] = useState(null), [error,setError] = useState('');
  async function load() { try { const r=await fetch(API+'/status'); if(!r.ok) throw Error('API unavailable'); setData(await r.json()); setError(''); } catch(e){setError('Backend connection failed: '+e.message)} }
  async function command(action) { try { const r=await fetch(API+'/bot/'+action,{method:'POST'}); if(!r.ok)throw Error('Request failed'); await load(); }catch(e){setError(e.message)} }
  useEffect(()=>{load(); const id=setInterval(load,5000);return ()=>clearInterval(id)},[]);
  return <SafeAreaView style={s.root}><StatusBar style="light"/><ScrollView contentContainerStyle={s.wrap}>
    <Text style={s.title}>TradePilot AI</Text><Text style={s.badge}>SIMULATED TRADING ONLY · NO REAL ORDERS</Text>
    <View style={s.card}><Text style={s.label}>Virtual Cash</Text><Text style={s.amount}>₹{data?.cash ?? '—'}</Text><Text style={s.label}>Bot: {data?.bot_running?'Running (paper)':'Stopped'}</Text></View>
    <View style={s.row}><Pressable style={s.button} onPress={()=>command('start')}><Text style={s.btnText}>Start Paper Bot</Text></Pressable><Pressable style={[s.button,s.stop]} onPress={()=>command('stop')}><Text style={s.btnText}>Stop Bot</Text></Pressable></View>
    <View style={s.card}><Text style={s.section}>Open Position</Text><Text style={s.label}>{data?.position ? data.position.symbol+' × '+data.position.quantity+' @ ₹'+data.position.entry:'No open position'}</Text></View>
    <View style={s.card}><Text style={s.section}>Trade History</Text>{data?.trades?.length ? data.trades.map((t,i)=><Text style={s.label} key={i}>{t.symbol}: ₹{t.pnl} ({t.reason})</Text>):<Text style={s.label}>No paper trades yet</Text>}</View>
    {!!error && <Text style={s.error}>{error}</Text>}
    <Text style={s.foot}>Prototype: no live feeds, strategy, authentication, or Groww connection. Requires a running backend.</Text>
  </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#0c1426'},wrap:{padding:24,gap:18},title:{fontSize:29,color:'white',fontWeight:'800'},badge:{color:'#fbbf24',fontWeight:'700'},card:{backgroundColor:'#1a2841',padding:20,borderRadius:16,gap:10},label:{color:'#c7d2e5',fontSize:15},amount:{color:'#7ee7c0',fontSize:38,fontWeight:'800'},section:{color:'white',fontSize:20,fontWeight:'700'},row:{flexDirection:'row',gap:10},button:{flex:1,backgroundColor:'#167d64',padding:14,borderRadius:12,alignItems:'center'},stop:{backgroundColor:'#9e3341'},btnText:{color:'white',fontWeight:'700'},error:{color:'#ff9b9b'},foot:{color:'#93a5bf',lineHeight:20}});
