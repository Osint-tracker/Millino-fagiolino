const courses=new Set(['520370','520371','560585','560586','520284','520308','520261']);
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).end();
 if(!courses.has(req.query.id))return res.status(400).end();
 const url='https://www.unibo.it/en/study/course-units-transferable-skills-moocs/course-unit-catalogue/course-unit/2026/'+req.query.id;
 try{const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();
 const html=await response.text();if(html.length>1500000)throw Error();
 res.setHeader('Cache-Control','public, max-age=3600');return res.status(200).json({html})}
 catch{return res.status(502).json({error:'Syllabus non disponibile. Incolla il testo da Unibo.'})}
}
