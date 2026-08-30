import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import{BookOpen,CalendarDays,Check,Dumbbell,Heart,Leaf,LogOut,NotebookPen,Palette,Pencil,Plus,RotateCcw,Ruler,Sparkles,Trash2,X}from"lucide-react";
import{supabase}from"./supabase";
import"./style.css";

const habitSeed=[["Ler","book","Todos os dias"],["Meditação 10 min","sparkles","Todos os dias"],["Exercício","gym","4× por semana"],["Momento com Deus","heart","Todos os dias"],["Arte","art","Quando precisar"],["Beber chá verde","leaf","Todos os dias"],["Journal","journal","Todos os dias"]];
const taskSeed=[["Revisão de Literatura","2026-03-01","2027-07-31"],["Estabelecimento de parcerias e desenvolvimento do protocolo de avaliação","2026-05-01","2026-09-30"],["Submissão à comissão de ética","2026-09-01","2026-09-30"],["Recrutamento e recolha de dados","2026-10-01","2027-01-31"],["Análise de dados","2027-02-01","2027-03-31"],["Interpretação e discussão","2027-04-01","2027-05-31"],["Entrega da dissertação","2027-06-01","2027-06-30"],["Defesa da dissertação","2027-07-01","2027-07-31"]];
const artSeed=["Fotografia","Vídeo","Desenhar","Pintar","Tocar piano","Tocar viola","Cantar","Croché"];
const verses=[
 ["Tudo posso naquele que me fortalece.","Filipenses 4:13"],
 ["O Senhor é o meu pastor; nada me faltará.","Salmos 23:1"],
 ["Entrega o teu caminho ao Senhor; confia nele, e ele o fará.","Salmos 37:5"],
 ["Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.","Filipenses 4:4"],
 ["O choro pode durar uma noite, mas a alegria vem pela manhã.","Salmos 30:5"],
 ["Não temas, porque eu sou contigo.","Isaías 41:10"],
 ["Lança o teu cuidado sobre o Senhor, e ele te susterá.","Salmos 55:22"],
 ["Deleita-te no Senhor, e ele te concederá o que deseja o teu coração.","Salmos 37:4"],
 ["A tua palavra é lâmpada para os meus pés e luz para o meu caminho.","Salmos 119:105"],
 ["Sê forte e corajoso; não temas nem te espantes.","Josué 1:9"],
 ["Buscai primeiro o reino de Deus e a sua justiça.","Mateus 6:33"],
 ["O Senhor é a minha força e o meu escudo; nele confiou o meu coração.","Salmos 28:7"],
 ["Bem-aventurados os que choram, porque eles serão consolados.","Mateus 5:4"],
 ["Esperei com paciência no Senhor, e ele se inclinou para mim.","Salmos 40:1"],
 ["Aquietai-vos e sabei que eu sou Deus.","Salmos 46:10"],
 ["O amor é sofredor, é benigno.","1 Coríntios 13:4"]
];
const iconMap={book:<BookOpen/>,sparkles:<Sparkles/>,gym:<Dumbbell/>,heart:<Heart/>,art:<Palette/>,leaf:<Leaf/>,journal:<NotebookPen/>};
const now=()=>new Date().toISOString().slice(0,10);
const fmt=d=>new Date(d+"T12:00:00").toLocaleDateString("pt-PT",{month:"short",year:"numeric"});
const fmtDay=d=>new Date(d+"T12:00:00").toLocaleDateString("pt-PT",{day:"numeric",month:"short",year:"numeric"});
const verseOfDay=()=>{const s=new Date(),start=new Date(s.getFullYear(),0,0),day=Math.floor((s-start)/86400000);return verses[day%verses.length]};

function App(){
 const[session,setSession]=useState(null),[ready,setReady]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(r=>{setSession(r.data.session);setReady(true)});const s=supabase.auth.onAuthStateChange((_e,x)=>setSession(x));return()=>s.data.subscription.unsubscribe()},[]);
 if(!ready)return <div className="splash"><Logo/><p>a preparar o teu espaço…</p></div>;
 return session?<Dashboard session={session}/>:<Auth/>;
}
function Auth(){
 const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[signup,setSignup]=useState(false),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setMessage("");const r=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});setBusy(false);setMessage(r.error?r.error.message:signup?"Conta criada. Confirma o email e depois inicia sessão.":"")}
 return <main className="auth"><section><div className="authart"><Logo/><p>Small steps, soft days,<br/><i>beautiful progress.</i></p></div><form onSubmit={submit}><em>O teu espaço pessoal</em><h1>{signup?"Cria o teu espaço ♡":"Bem-vinda de volta ♡"}</h1><p>Hábitos, tese e evolução — tudo num lugar só.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Palavra-passe<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{message&&<div className="message">{message}</div>}<button className="primary">{busy?"A guardar…":signup?"Criar conta":"Entrar"}</button><button type="button" className="link" onClick={()=>{setSignup(!signup);setMessage("")}}>{signup?"Já tens conta? Entrar":"Ainda não tens conta? Criar conta"}</button></form></section></main>;
}
function Dashboard({session}){
 const[tab,setTab]=useState("daily"),[habits,setHabits]=useState([]),[tasks,setTasks]=useState([]),[measures,setMeasures]=useState([]),[done,setDone]=useState(new Set()),[artList,setArtList]=useState([]),[art,setArt]=useState(""),[modal,setModal]=useState(null),[artOpen,setArtOpen]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){
  setLoading(true);setError("");
  const getData=()=>Promise.all([
   supabase.from("habits").select("*").order("sort_order"),
   supabase.from("thesis_tasks").select("*").order("sort_order"),
   supabase.from("measurements").select("*").order("measured_on"),
   supabase.from("habit_completions").select("habit_id").eq("completed_on",now()),
   supabase.from("art_ideas").select("*").order("sort_order")
  ]);
  let q;
  for(let attempt=0;attempt<3;attempt++){
   q=await getData();
   if(!q.some(x=>x.error))break;
   if(attempt<2)await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));
  }
  const bad=q.find(x=>x.error);
  if(bad){
   console.error("Erro ao carregar dados do Supabase",bad.error);
   const schemaError=["42P01","42703","PGRST204","PGRST205"].includes(bad.error?.code);
   setError(schemaError
    ?"A estrutura da base de dados precisa de ser atualizada."
    :navigator.onLine
     ?"Não foi possível ligar à base de dados. Pode ser uma falha temporária."
     :"O iPhone está sem ligação à internet.");
   setLoading(false);return
  }
  if(!q[0].data.length){const r=await supabase.from("habits").insert(habitSeed.map((x,i)=>({name:x[0],icon:x[1],frequency:x[2],sort_order:i+1})));if(r.error){setError("Não foi possível criar os hábitos iniciais.");setLoading(false);return}return load()}
  if(!q[1].data.length){const r=await supabase.from("thesis_tasks").insert(taskSeed.map((x,i)=>({title:x[0],start_date:x[1],end_date:x[2],sort_order:i+1})));if(r.error){setError("Não foi possível criar as tarefas iniciais.");setLoading(false);return}return load()}
  if(!q[4].data.length){const r=await supabase.from("art_ideas").insert(artSeed.map((x,i)=>({label:x,sort_order:i+1})));if(r.error){setError("Não foi possível criar a roleta da arte.");setLoading(false);return}return load()}
  setHabits(q[0].data);setTasks(q[1].data);setMeasures(q[2].data);setDone(new Set(q[3].data.map(x=>x.habit_id)));setArtList(q[4].data);setArt(a=>a||q[4].data[0].label);setLoading(false)
 }
 useEffect(()=>{load()},[]);
 async function toggleHabit(id){done.has(id)?await supabase.from("habit_completions").delete().eq("habit_id",id).eq("completed_on",now()):await supabase.from("habit_completions").insert({habit_id:id,completed_on:now()});const n=new Set(done);n.has(id)?n.delete(id):n.add(id);setDone(n)}
 async function toggleTask(t){await supabase.from("thesis_tasks").update({is_done:!t.is_done}).eq("id",t.id);setTasks(v=>v.map(x=>x.id===t.id?{...x,is_done:!x.is_done}:x))}
 async function remove(table,id,setter){if(!confirm("Queres mesmo eliminar?"))return;await supabase.from(table).delete().eq("id",id);setter(v=>v.filter(x=>x.id!==id))}
 function roll(){if(artList.length)setArt(artList[Math.floor(Math.random()*artList.length)].label)}
 const hp=Math.round(done.size/Math.max(habits.length,1)*100),tp=Math.round(tasks.filter(x=>x.is_done).length/Math.max(tasks.length,1)*100);
 return <div className="shell"><aside><Logo/><nav><Nav active={tab==="daily"} go={()=>setTab("daily")} icon={<CalendarDays/>}>Daily list</Nav><Nav active={tab==="thesis"} go={()=>setTab("thesis")} icon={<BookOpen/>}>Tese</Nav><Nav active={tab==="gym"} go={()=>setTab("gym")} icon={<Dumbbell/>}>Gym girlie</Nav></nav><div className="quote"><Sparkles/><p>Small steps, soft days,<br/><i>beautiful progress.</i></p></div><div className="profile"><b>♡</b><span>{session.user.email}<button onClick={()=>supabase.auth.signOut()}><LogOut/>Sair</button></span></div></aside><main><div className="mobiletop"><Logo/></div><div className="mobilenav"><Nav active={tab==="daily"} go={()=>setTab("daily")} icon={<CalendarDays/>}>Daily</Nav><Nav active={tab==="thesis"} go={()=>setTab("thesis")} icon={<BookOpen/>}>Tese</Nav><Nav active={tab==="gym"} go={()=>setTab("gym")} icon={<Dumbbell/>}>Gym</Nav></div>{error?<div className="error"><h2>Não conseguimos carregar o teu espaço</h2><p>{error}</p><button className="primary" onClick={load}>Tentar novamente</button></div>:loading?<div className="splash">a carregar…</div>:tab==="daily"?<Daily data={habits} done={done} progress={hp} toggle={toggleHabit} remove={id=>remove("habits",id,setHabits)} art={art} roll={roll} configure={()=>setArtOpen(true)} add={()=>setModal("habit")}/>:tab==="thesis"?<Thesis data={tasks} progress={tp} toggle={toggleTask} remove={id=>remove("thesis_tasks",id,setTasks)} add={()=>setModal("task")}/>:<Gym data={measures} remove={id=>remove("measurements",id,setMeasures)} add={()=>setModal("measure")}/>}</main>{modal&&<Modal type={modal} close={()=>setModal(null)} saved={load}/>}{artOpen&&<ArtModal ideas={artList} close={()=>setArtOpen(false)} saved={load}/>}</div>;
}
function Daily({data,done,progress,toggle,remove,art,roll,configure,add}){const[vText,vRef]=verseOfDay();return <div className="page"><Title eyebrow={new Date().toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long"})} title="Bom dia, bonita" sub="Hoje não precisas de fazer tudo. Só precisas de começar." action={add} button="Novo hábito"/><div className="dailygrid"><section className="card panel"><CardTitle label="O teu ritmo" title="Daily list"><div className="ring" style={{"--p":progress*3.6+"deg"}}><span>{progress}%</span></div></CardTitle>{data.map(h=><div className={"row "+(done.has(h.id)?"done":"")} key={h.id}><button className="check" onClick={()=>toggle(h.id)}>{done.has(h.id)&&<Check/>}</button><i>{iconMap[h.icon]||<Sparkles/>}</i><div><b>{h.name}</b><small>{h.frequency}</small></div><Delete go={()=>remove(h.id)}/></div>)}<button className="add" onClick={add}><Plus/>Adicionar à lista</button></section><div className="side"><section className="card art"><button className="artedit" onClick={configure} aria-label="Configurar roleta"><Pencil/></button><div className="arthead"><i><Palette/></i><div><em>Momento criativo</em><h2>Roleta da arte</h2></div></div><p>Deixa o acaso escolher e começa sem pensar demasiado.</p><div className="result"><small>Hoje vais…</small><b>{art}</b></div><button className="primary" onClick={roll}><RotateCcw/>Rodar a roleta</button></section><section className="card reminder"><Sparkles/><div><em>Lembrete do dia</em><p>“{vText}”</p><cite>{vRef}</cite></div></section></div></div></div>}
function Thesis({data,progress,toggle,remove,add}){return <div className="page"><Title eyebrow="a tua investigação" title="A minha tese" sub="Um passo de cada vez até à defesa." action={add} button="Adicionar tarefa"/><div className="stats"><Stat l="Progresso geral" v={progress+"%"} n={data.filter(x=>x.is_done).length+" de "+data.length+" fases concluídas"}/><Stat l="Próximo marco" v="Set 2026" n="Submissão à comissão de ética"/><Stat l="Objetivo final" v="Jul 2027" n="Defesa da dissertação"/></div><section className="card panel"><CardTitle label="Planificação" title="Checklist da tese"><span className="pill"><CalendarDays/>Mar 2026 — Jul 2027</span></CardTitle>{data.map((t,i)=><div className={"task "+(t.is_done?"done":"")} key={t.id}><button className="check" onClick={()=>toggle(t)}>{t.is_done&&<Check/>}</button><i>{String(i+1).padStart(2,"0")}</i><div><b>{t.title}</b><small><CalendarDays/>{fmt(t.start_date)} — {fmt(t.end_date)}</small></div><Delete go={()=>remove(t.id)}/></div>)}</section></div>}
function Gym({data,remove,add}){
 const byMonth={};for(const m of data){const k=m.measured_on.slice(0,7);(byMonth[k]=byMonth[k]||[]).push(m)}
 const keys=Object.keys(byMonth).sort();
 const avg=(rows,f)=>{const v=rows.map(r=>r[f]).filter(x=>x!=null&&x!=="").map(Number);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
 const monthly=keys.map(k=>({key:k,month:k+"-01",count:byMonth[k].length,weight:avg(byMonth[k],"weight"),waist:avg(byMonth[k],"waist"),hip:avg(byMonth[k],"hip"),chest:avg(byMonth[k],"chest"),thigh:avg(byMonth[k],"thigh"),arm:avg(byMonth[k],"arm")}));
 const cur=monthly.at(-1),prev=monthly.at(-2),diff=cur&&prev&&cur.weight!=null&&prev.weight!=null?cur.weight-prev.weight:null,last=data.at(-1),n1=x=>x==null?"—":Number(x).toFixed(1);
 return <div className="page"><Title eyebrow="strong body · soft heart" title="Gym girlie" sub="Regista todos os dias — a app faz a média de cada mês." action={add} button="Novo registo"/><div className="stats"><Stat l="Média do mês" v={cur?n1(cur.weight)+" kg":"— kg"} n={diff==null?"Regista para veres a média":(diff>0?"+":"")+diff.toFixed(1)+" kg vs mês anterior"}/><Stat l="Último registo" v={last?fmtDay(last.measured_on):"—"} n={cur?cur.count+" registo"+(cur.count>1?"s":"")+" este mês":"Registo diário"}/><Stat l="Registos" v={String(data.length)} n="dias na tua jornada"/></div>{!data.length?<section className="card empty"><i><Ruler/></i><h2>Começa a tua jornada</h2><p>Regista o peso e as medidas sempre que quiseres.</p><button className="primary" onClick={add}><Plus/>Adicionar primeiro registo</button></section>:<><section className="card panel"><CardTitle label="Média mensal" title="Cada mês conta como um"><button className="round" onClick={add}><Plus/></button></CardTitle><div className="tablewrap"><table><thead><tr><th>Mês</th><th>Peso</th><th>Cintura</th><th>Anca</th><th>Peito</th><th>Coxa</th><th>Braço</th><th>Dias</th></tr></thead><tbody>{[...monthly].reverse().map(m=><tr key={m.key}><td>{fmt(m.month)}</td><td>{n1(m.weight)} kg</td>{["waist","hip","chest","thigh","arm"].map(f=><td key={f}>{n1(m[f])} cm</td>)}<td>{m.count}</td></tr>)}</tbody></table></div></section><section className="card panel"><CardTitle label="Diário" title="Todos os registos"/>{[...data].reverse().map(m=><div className="entry" key={m.id}><div className="who"><b>{m.weight} kg</b><small>{fmtDay(m.measured_on)}</small></div><span className="meas">{[["Cintura",m.waist],["Anca",m.hip],["Peito",m.chest],["Coxa",m.thigh],["Braço",m.arm]].filter(x=>x[1]).map(x=>x[0]+" "+x[1]+" cm").join(" · ")||"—"}</span><Delete go={()=>remove(m.id)}/></div>)}</section></>}</div>;
}
function Logo(){return <div className="logo"><i>h</i><div><b>her space</b><small>the soft life planner</small></div></div>}
function Nav({active,go,icon,children}){return <button className={active?"active":""} onClick={go}>{icon}{children}</button>}
function Title({eyebrow,title,sub,action,button}){return <header className="title"><div><em>{eyebrow}</em><h1>{title}<i>♡</i></h1><p>{sub}</p></div><button onClick={action}><Plus/>{button}</button></header>}
function CardTitle({label,title,children}){return <div className="cardtitle"><div><em>{label}</em><h2>{title}</h2></div>{children}</div>}
function Delete({go}){return <button className="delete" onClick={go}><Trash2/></button>}
function Stat({l,v,n}){return <section className="card stat"><em>{l}</em><b>{v}</b><small>{n}</small></section>}
function ArtModal({ideas,close,saved}){
 const[list,setList]=useState(ideas),[val,setVal]=useState(""),[busy,setBusy]=useState(false);
 async function add(){const label=val.trim();if(!label)return;setBusy(true);const order=(list.at(-1)?.sort_order||list.length)+1;const r=await supabase.from("art_ideas").insert({label,sort_order:order}).select();setBusy(false);if(r.error){alert(r.error.message);return}setVal("");setList(l=>[...l,...(r.data||[])]);saved()}
 async function del(id){setList(l=>l.filter(x=>x.id!==id));await supabase.from("art_ideas").delete().eq("id",id);saved()}
 return <div className="backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="modal"><button className="close" onClick={close}><X/></button><em>Personalizar</em><h2>Roleta da arte</h2><p className="modalsub">Escolhe as atividades que podem sair na roleta.</p><ul className="artlist">{list.map(x=><li key={x.id}><span>{x.label}</span><button onClick={()=>del(x.id)} aria-label="Remover"><Trash2/></button></li>)}{!list.length&&<li className="muted">Ainda não há atividades.</li>}</ul><div className="artadd"><input value={val} placeholder="Nova atividade" onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add()}}}/><button className="primary" onClick={add} disabled={busy}><Plus/>Adicionar</button></div></section></div>;
}
function Modal({type,close,saved}){async function submit(e){e.preventDefault();const f=new FormData(e.currentTarget);let q;if(type==="habit")q=supabase.from("habits").insert({name:f.get("name"),icon:f.get("icon"),frequency:f.get("frequency")});if(type==="task")q=supabase.from("thesis_tasks").insert({title:f.get("title"),start_date:f.get("start"),end_date:f.get("end")});if(type==="measure")q=supabase.from("measurements").insert({measured_on:f.get("date"),weight:f.get("weight"),waist:f.get("waist")||null,hip:f.get("hip")||null,chest:f.get("chest")||null,thigh:f.get("thigh")||null,arm:f.get("arm")||null});const r=await q;if(r.error)alert(r.error.message);else{close();saved()}}return <div className="backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="modal"><button className="close" onClick={close}><X/></button><em>Personalizar</em><h2>{type==="habit"?"Novo hábito":type==="task"?"Nova tarefa da tese":"Novo registo"}</h2><form onSubmit={submit}>{type==="habit"&&<><label>Nome<input name="name" required/></label><div className="fields"><label>Ícone<select name="icon"><option value="book">Livro</option><option value="sparkles">Brilho</option><option value="gym">Exercício</option><option value="heart">Coração</option><option value="art">Arte</option><option value="leaf">Folha</option><option value="journal">Journal</option></select></label><label>Frequência<input name="frequency" defaultValue="Todos os dias"/></label></div></>}{type==="task"&&<><label>Tarefa<textarea name="title" required/></label><div className="fields"><label>Início<input type="date" name="start" required/></label><label>Fim<input type="date" name="end" required/></label></div></>}{type==="measure"&&<><div className="fields"><label>Dia<input type="date" name="date" defaultValue={now()} required/></label><label>Peso (kg)<input type="number" step=".1" name="weight" required/></label></div><div className="fields three">{[["waist","Cintura"],["hip","Anca"],["chest","Peito"],["thigh","Coxa"],["arm","Braço"]].map(x=><label key={x[0]}>{x[1]} (cm)<input name={x[0]} type="number" step=".1"/></label>)}</div></>}<div className="actions"><button type="button" onClick={close}>Cancelar</button><button className="primary">Guardar</button></div></form></section></div>}
createRoot(document.getElementById("root")).render(<App/>);
