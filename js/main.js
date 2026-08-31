document.addEventListener('DOMContentLoaded',function(){
  const btn=document.getElementById('loginBtn');
  if(btn){btn.addEventListener('click',()=>{window.location.href='index.html'})}
  // dropdown toggle for brand
  const toggles=document.querySelectorAll('.dropdown-toggle');
  toggles.forEach(t=>{
    t.addEventListener('click',e=>{
      const parent=t.closest('.dropdown');
      if(parent) parent.classList.toggle('show');
    });
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.dropdown')){
      document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('show'));
    }
  });
});
