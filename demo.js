const questions=[
  {text:'根据文章，以下哪项最完整地描述萤类发光的能量机制？',options:['腹部先吸收环境光，再通过热辐射释放能量','腹部发光器中的底物与酶促反应体系耦合，驱动光子释放且不依赖热辐射','闪光主要由翅膀摩擦产生的热量转化而来'],answer:1},
  {text:'文章将哪些时间特征共同视为闪光节律编码的组成部分？',options:['单次持续时长、明暗间隔周期与脉冲排布','发光颜色、腹部位置与周围温度','个体数量、栖息地类型与观察距离'],answer:0},
  {text:'按照文章，物种特异性的闪光节律主要承担什么作用？',options:['让所有物种使用相同信号，避免节律差异','帮助同种个体识别与求偶等信息交换','只用于说明个体腹部发光器的位置'],answer:1},
  {text:'哪一顺序最符合文章描述的个体间双向通讯过程？',options:['发出闪光 → 产生热量 → 停止通讯','记录发光位置 → 判断物种 → 不再回应','感知同类闪光刺激 → 触发发光应答 → 形成反馈互动'],answer:2},
  {text:'若要按文章建议开展野外记录，哪组变量最完整？',options:['发光位点与闪光节律特征','光的亮度、观察者年龄、天气预报','发光位点、闪光节律特征、信号应答事件'],answer:2},
  {text:'文章提醒三项观测变量不宜相互替代。以下哪项解释最符合这一提醒？',options:['只要记录发光位置，就能直接推断全部通讯过程','发光位置、节律编码和个体应答分别提供不同层面的证据','观察到闪光应答即可确定发光的具体生化机制'],answer:1}
];
const takeaways=[
  {title:'冷光机制',detail:'底物与酶促反应耦合，驱动光子释放。'},
  {title:'节律编码',detail:'持续时长、间隔周期与脉冲排布共同构成信号。'},
  {title:'通讯功能',detail:'物种特异性节律帮助同种个体识别与求偶。'},
  {title:'双向互动',detail:'感知同类闪光后发出应答，形成反馈链路。'},
  {title:'野外记录',detail:'记录发光位点、闪光节律与信号应答事件。'},
  {title:'证据层次',detail:'机制、节律编码与个体应答是不同层面的证据。'}
];
const body=document.body,condition=body.dataset.condition,immediate=condition==='D_LOW',highValue=condition==='V_HIGH';
const state={condition,scenarioShownAt:new Date().toISOString(),taskStartedAt:null,taskStartLatencyMs:null,answers:[],completedAt:null};
let startTime=performance.now(),questionIndex=0,selected=null,score=0;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));}
function initStudyCursor(){
  const cursor=document.createElement('div');
  cursor.className='study-cursor';
  cursor.setAttribute('aria-hidden','true');
  document.body.appendChild(cursor);
  document.body.classList.add('study-cursor-enabled');
  document.addEventListener('pointermove',event=>{
    cursor.style.left=`${event.clientX}px`;
    cursor.style.top=`${event.clientY}px`;
    cursor.classList.add('visible');
  });
  document.addEventListener('pointerdown',()=>cursor.classList.add('pressed'));
  document.addEventListener('pointerup',()=>cursor.classList.remove('pressed'));
  document.addEventListener('pointercancel',()=>cursor.classList.remove('pressed'));
  document.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
}
function renderQuestion(){
  if(questionIndex>=questions.length){finishTask();return;}
  const q=questions[questionIndex];selected=null;
  $('question-count').textContent=`第 ${questionIndex+1} 题，共 6 题`;
  $('progress-bar').style.width=`${(questionIndex/6)*100}%`;
  $('question-text').textContent=q.text;
  $('answer-feedback').textContent='';
  $('answer-feedback').className='answer-feedback'+(immediate?'':' neutral');
  $('choices').innerHTML=q.options.map((label,i)=>`<button class="choice" type="button" data-choice="${i}">${label}</button>`).join('');
  $('choices').querySelectorAll('.choice').forEach(button=>button.addEventListener('click',()=>{
    selected=Number(button.dataset.choice);
    $('choices').querySelectorAll('.choice').forEach(item=>item.classList.toggle('selected',item===button));
    $('submit-answer').disabled=false;
  }));
  $('submit-answer').disabled=true;
  $('submit-answer').textContent=questionIndex===5?'提交并完成':'提交本题';
  $('submit-answer').onclick=submitAnswer;
}
function submitAnswer(){
  if(selected===null)return;
  const q=questions[questionIndex],correct=selected===q.answer;
  if(correct)score++;
  state.answers.push({question:questionIndex+1,answer:selected,correct});
  const feedback=$('answer-feedback');
  if(highValue){
    feedback.className='answer-feedback value-reminder';
    const unlocked=state.answers.length;
    const lessonMarkup=takeaways.slice(0,unlocked).map((item,index)=>`<li class="value-lesson"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${item.title}</strong><small>${item.detail}</small></div></li>`).join('');
    feedback.innerHTML=`<div class="value-reminder-head"><span class="value-reminder-icon" aria-hidden="true">✦</span><div class="value-reminder-copy"><strong>完成全部题目后，你将获得</strong><b>可保存的萤火虫观察知识卡</b></div><span class="value-count">${unlocked}/6</span></div><div class="value-meter"><i style="width:${unlocked/6*100}%"></i></div><ol class="value-lessons">${lessonMarkup}</ol><small class="value-reminder-foot">每完成一道题，就为你的观察知识卡增加一条新发现。</small>`;
  }else{
    feedback.className='answer-feedback'+(immediate&&correct?' correct-feedback':immediate?'':' neutral');
    if(immediate){
      const completed=state.answers.length;
      const remaining=questions.length-completed;
      const estimatedSeconds=remaining*15;
      const milestone=completed>0&&completed%2===0;
      feedback.textContent=`回答${correct?'正确':'错误'}！`+(milestone&&remaining>0?` 还有 ${remaining} 道题就完成了，预计 ${estimatedSeconds} 秒。`:milestone&&remaining===0?' 六道题已完成。':'');
      if(milestone)feedback.classList.add('milestone-encouragement');
    }else feedback.textContent='';
  }
  questionIndex++;
  $('submit-answer').disabled=false;
  if(questionIndex===questions.length){
    $('submit-answer').textContent='提交并完成';
    $('submit-answer').onclick=finishTask;
  }else{
    $('submit-answer').textContent='下一题';
    $('submit-answer').onclick=renderQuestion;
  }
}
function finishTask(){
  state.completedAt=new Date().toISOString();
  $('progress-bar').style.width='100%';
  $('final-score').textContent=`你已完成全部题目，答对 ${score} 题，共 6 题。`;
  if(highValue){
    $('outcome').innerHTML='<section class="knowledge" data-aoi="knowledge-card"><div class="knowledge-kicker">FIREFLY FIELD NOTES · 萤火虫观察手记</div><h3>这次阅读，你带走了 6 个发现</h3><p class="knowledge-intro">把文章中的关键线索整理成一张可保存的观察卡：从光如何产生，到信号如何被读懂。</p><div class="fact-grid"><article class="fact"><span>01 · 冷光机制</span><strong>底物 × 酶促反应</strong><p>腹部特化发光器中的生化反应驱动光子释放，不依赖热辐射。</p></article><article class="fact"><span>02 · 节律编码</span><strong>时长 · 间隔 · 脉冲</strong><p>闪光的时间组合形成节律模式，成为物种间可区分的信号编码。</p></article><article class="fact"><span>03 · 通讯功能</span><strong>识别与求偶</strong><p>物种特异性的闪光节律帮助同种个体识别并进行求偶等信息交换。</p></article><article class="fact"><span>04 · 双向互动</span><strong>接收 → 应答 → 反馈</strong><p>感知同类闪光后作出发光回应，构成双向通讯链条。</p></article><article class="fact"><span>05 · 野外记录</span><strong>三项核心变量</strong><p>记录发光位点、闪光节律特征，以及周边个体的信号应答事件。</p></article><article class="fact"><span>06 · 证据层次</span><strong>机制 · 编码 · 应答</strong><p>发光位置、节律编码与个体间应答各自提供不同证据，不应混为一谈。</p></article></div><div class="knowledge-note"><strong>带着问题去观察</strong><span>光从哪里发出？闪光节奏如何重复？是否出现了与之匹配的回应？</span></div><a class="save-card" id="save-card" download="firefly-observation-card.txt">保存完整知识卡 ↓</a></section>';
    const fileText='萤火虫观察知识卡｜这次阅读，你带走了 6 个发现\n\n01 冷光机制：腹部特化发光器中的生化反应驱动光子释放，不依赖热辐射。\n\n02 节律编码：闪光的持续时长、间隔周期与脉冲排布共同形成信号节律。\n\n03 通讯功能：物种特异性的闪光节律帮助同种个体识别并进行求偶等信息交换。\n\n04 双向互动：感知同类闪光后作出发光回应，形成“接收—应答—反馈”的通讯链条。\n\n05 野外记录：记录发光位点、闪光节律特征与信号应答事件。\n\n06 证据层次：发光位置、节律编码与个体间应答各自提供不同证据，不应混为一谈。\n\n观察提示：光从哪里发出？闪光节奏如何重复？是否出现了与之匹配的回应？';
    $('save-card').href=URL.createObjectURL(new Blob([fileText],{type:'text/plain;charset=utf-8'}));
  }else{$('outcome').innerHTML='';}
  show('complete');
  window.dispatchEvent(new CustomEvent('study:task-complete',{detail:{...state,score}}));
}
function init(){
  initStudyCursor();
  const highlightedCopy={
    U_HIGH:'请阅读一篇萤火虫科普文章并完成 6 道题。任务需要<span class="manipulation-highlight">持续阅读并逐题核对文章信息</span>。',
    U_LOW:'请阅读同一篇萤火虫科普文章并完成 6 道题。<span class="manipulation-highlight">题目简短、步骤清楚，每次只需处理当前一题</span>。',
    V_HIGH:'<span class="manipulation-highlight">完成任务后，系统会为你生成一张可保存的萤火虫观察知识卡</span>，整理短文中的要点，供之后了解或观察萤火虫时参考。',
    V_LOW:'请阅读文章并完成 6 道选择题。',
    D_HIGH:'请完成 6 道选择题。<span class="manipulation-highlight">提交全部题目后，系统会统一显示每道题的答题反馈</span>。',
    D_LOW:'<span class="manipulation-highlight">阅读文章预计花费 2 分钟，每道题作答后可立即知道对错</span>。'
  };
  $('scenario-copy').innerHTML=highlightedCopy[condition]||body.dataset.scenario;
  $('acknowledgement-button').addEventListener('click',()=>show('intro'));
  $('start-button').addEventListener('click',()=>{
    state.taskStartedAt=new Date().toISOString();
    state.taskStartLatencyMs=Math.round(performance.now()-startTime);
    window.__demoData=state;
    window.dispatchEvent(new CustomEvent('study:task-start',{detail:{...state}}));
    show('reading');
  });
  $('continue-to-questions').addEventListener('click',()=>{
    show('task');
  });
  $('review-article').addEventListener('click',()=>show('reading'));
  $('submit-answer').onclick=submitAnswer;
  $('finish-button').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('study:task-finish',{detail:{...state,score}})));
  renderQuestion();
  window.__demoData=state;
}
document.addEventListener('DOMContentLoaded',init);
