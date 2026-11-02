/* All event handlers, DOM building and motion use jQuery. No CSS animation. */
$(function () {
  const motion = $('body').attr('data-task') === '2';
  let party = structuredClone(INITIAL_PARTY), busy = false, activeGuest = null, modalVersion = 0;
  const sorted = {}, colors = {green:'#299267',black:'#2b3036',yellow:'#e3a921',purple:'#9661c9',blue:'#427de1',red:'#dd5560'};
  const icons = {phone:'▯',glasses:'♧',bag:'♜',cup:'☕',crumbs:'▧'};
  const titles = ['Who is in the hall?','Yellow or purple clothing','AITU students upstairs','Glasses or a bag','Nothing at all','Phone, but no bag','Arrived 20:30–21:00 inclusive','After 21:00, not AITU','Right next to Askar','Last in each room','Third in each room','After Timur','Right before someone in black','Room containing Aruzhan','Rooms with fewer than six guests','Cup present, no glasses','First arrival in each room','Miras joins Askar and Inkar','Natasha goes home','Who took the cake?'];
  function card(g) {
    return $('<button>', {type:'button',class:'guest '+g.color+(g.aitu?' aitu-student':'')+' '+g.things.map(x=>'has-'+x).join(' '), 'data-name':g.name,'data-time':g.time,'data-color':g.color,'data-aitu':String(g.aitu),'data-things':g.things.join(' '),'aria-label':g.name+', arrived '+g.time})
      .css('--ring', colors[g.color]).data('guest',structuredClone(g))
      .append($('<img>',{class:'avatar',src:'../assets/avatars/'+g.name+'.svg',alt:''}),$('<strong>',{class:'guest-name',text:g.name}),$('<span>',{class:'time',text:g.time}),$('<span>',{class:'items',text:g.things.map(x=>icons[x]).join(' '),title:g.things.join(', ')||'No things'}),$('<span>',{class:'aitu',text:g.aitu?'AITU':' '}));
  }
  function build() {
    closeProfile(true);
    $('#house').empty();
    [2,1].forEach(f=>{
      const $floor=$('<section>',{class:'floor','data-floor':f}).append($('<h2>',{class:'floor-title',text:f===2?'02 / UPSTAIRS':'01 / DOWNSTAIRS'}));
      const $rooms=$('<div>',{class:'rooms'}).appendTo($floor);
      party.filter(r=>r.floor===f).forEach(r=>{
        const $room=$('<section>',{class:'room',id:r.id,'data-room-name':r.name});
        const $head=$('<div>',{class:'room-head'}).append($('<h2>').text(r.name).append($('<small>').text(r.guests.length+' guests')));
        if(motion) $head.append($('<button>',{class:'sort',text:sorted[r.id]?'Picture order ↶':'Sort by time ↗'}));
        $room.append($head,$('<div>',{class:'guests'}).append(r.guests.map(card))).appendTo($rooms);
      });
      $floor.appendTo('#house');
    });
  }
  // Each function returns one jQuery chain; all searches use the rendered DOM.
  const cases = [
    () => $('#hall .guest'),
    () => $('.guest.yellow, .guest.purple'),
    () => $('.floor[data-floor="2"] .guest.aitu-student'),
    () => $('.guest.has-glasses, .guest.has-bag'),
    () => $('.guest[data-things=""]'),
    () => $('.guest.has-phone:not(.has-bag)'),
    () => $('.guest').filter(function(){ return $(this).attr('data-time') >= '20:30' && $(this).attr('data-time') <= '21:00'; }),
    () => $('.guest:not(.aitu-student)').filter(function(){ return $(this).attr('data-time') > '21:00'; }),
    () => $('.guest[data-name="Askar"]').prev('.guest').add($('.guest[data-name="Askar"]').next('.guest')),
    () => $('.guest:last-child'),
    () => $('.guest:nth-child(3)'),
    () => $('.guest[data-name="Timur"]').nextAll('.guest'),
    () => $('.guest.black').prev('.guest'),
    () => $('.guest[data-name="Aruzhan"]').closest('.room'),
    () => $('.room').filter(function(){ return $(this).find('.guest').length < 6; }),
    () => $('.room:has(.has-cup):not(:has(.has-glasses))'),
    () => $('.guest').filter(function(){ return $(this).siblings('.guest').filter((i,el)=>$(el).attr('data-time') < $(this).attr('data-time')).length === 0; }),
    () => card({name:'Miras',color:'blue',time:'21:20',aitu:true,things:['phone'],order:4}).hide().insertAfter($('.guest[data-name="Askar"]')).fadeIn(300),
    () => $('.guest[data-name="Natasha"]').animate({top:-10},160).animate({top:0},160).fadeOut(300,function(){ $(this).remove(); updateCounts(); }),
    () => $('.floor[data-floor="1"] .guest.has-crumbs:not(.has-cup)').filter(function(){ return $(this).attr('data-time') > '21:00' && $(this).attr('data-time') < '21:30'; }).filter(function(){ return $(this).prev('.aitu-student').add($(this).next('.aitu-student')).length > 0; })
  ];
  function updateCounts(){ $('.room').each(function(){ $(this).find('h2 small').text($(this).find('.guest').length+' guests'); }); }
  function runCase(n) {
    if(busy) return;
    build();
    const $found=cases[n-1](), isRoom=$found.is('.room');
    const names=$found.map((i,e)=>$(e).attr(isRoom?'data-room-name':'data-name')).get();
    const $guests=isRoom?$found.find('.guest'):$found;
    $found.addClass('found');
    if(motion) $('.guest').not($guests).stop(true,true).fadeTo(300,.2);
    if(n!==19) $guests.animate({top:-10},160).animate({top:0},160);
    $('#result-label').text('CASE '+String(n).padStart(2,'0')+' / '+titles[n-1]);
    $('#result').text(names.length+' '+(isRoom?'room(s)':'guest(s)')+': '+(names.join(', ')||'None')+(n===19?' — leaving the party.':''));
    $('#chain').text(cases[n-1].toString());
    $('#case').val(n); $('.case-buttons button').removeClass('active').filter('[data-case="'+n+'"]').addClass('active');
    updateCounts();
  }
  function closeProfile(immediate=false, after) {
    const version=++modalVersion, $profile=$('#profile');
    $profile.stop(true,false);
    if(!activeGuest || immediate){ $('#overlay').prop('hidden',true); activeGuest=null; if(after)after(); return; }
    const $avatar=activeGuest.find('.avatar'), off=$avatar.offset();
    const target=off?{left:off.left-$(window).scrollLeft(),top:off.top-$(window).scrollTop(),width:54,height:54,opacity:0}:{opacity:0};
    $profile.animate(target,200,function(){ if(version!==modalVersion)return; $('#overlay').prop('hidden',true); activeGuest=null; if(after)after(); });
  }
  function openProfile($guest) {
    if(busy || !motion)return;
    if(activeGuest){ closeProfile(false,()=>openProfile($guest)); return; }
    activeGuest=$guest; ++modalVersion;
    const g=$guest.data('guest'), off=$guest.find('.avatar').offset(), width=Math.min(360,$(window).width()-32);
    const $profile=$('#profile').empty().append($('<button>',{class:'close',text:'×','aria-label':'Close guest card'}),$('<h2>',{text:g.name}),$('<p>',{text:'Came at '+g.time+'. '+(g.aitu?'AITU student.':'Not an AITU student.')+' Wearing '+g.color+'.'}),$('<p>',{text:g.things.length?'Has '+g.things.join(', ')+'.':'Came with nothing.'}),$('<p>',{text:'Currently in the '+$guest.closest('.room').attr('data-room-name')+'.'}));
    const $buttons=$('<div>',{class:'move-buttons'}).appendTo($profile);
    party.filter(r=>r.id!==$guest.closest('.room').attr('id')).forEach(r=>$('<button>',{'data-move':r.id,text:'Move to the '+r.name.toLowerCase()}).appendTo($buttons));
    $('#overlay').prop('hidden',false);
    $profile.css({width:width,height:'auto',left:0,top:0,opacity:1}); const height=$profile.outerHeight();
    $profile.css({left:off.left-$(window).scrollLeft(),top:off.top-$(window).scrollTop(),width:54,height:54,opacity:0}).animate({left:($(window).width()-width)/2,top:Math.max(16,($(window).height()-height)/2),width,height,opacity:1},240,()=>{ $profile.find('.close').trigger('focus'); });
  }
  function syncRoom($room) {
    party.find(r=>r.id===$room.attr('id')).guests=$room.find('.guest').map((i,e)=>structuredClone($(e).data('guest'))).get();
  }
  function moveGuest(destination) {
    if(busy||!activeGuest)return;
    busy=true; $('body').addClass('busy');
    const $guest=activeGuest, $old=$guest.closest('.room'), $dest=$('#'+destination), from=$guest.offset(), width=$guest.outerWidth(), height=$guest.outerHeight();
    closeProfile(true);
    $('.guest').stop(true,true).css({top:0,left:0});
    const $fly=$guest.clone().removeClass('found').addClass('flight').css({left:from.left-$(window).scrollLeft(),top:from.top-$(window).scrollTop(),width,height,opacity:1}).appendTo('body');
    const $gap=$('<div>',{class:'slot'}).css({width,height}).insertBefore($guest);
    const order=Math.max(-1,...party.find(r=>r.id===destination).guests.map(g=>g.order))+1;
    $guest.data('guest').order=order;
    $guest.appendTo($dest.find('.guests')).css({visibility:'hidden',opacity:1});
    const to=$guest.offset(), destWidth=$guest.outerWidth();
    $guest.css({flex:'0 0 auto',width:0,paddingLeft:0,paddingRight:0});
    $gap.animate({width:0},550);
    $guest.animate({width:destWidth},550);
    $fly.animate({left:to.left-$(window).scrollLeft(),top:to.top-$(window).scrollTop(),width:destWidth},550,function(){
      $fly.remove();$gap.remove();$guest.removeAttr('style').css('--ring',colors[$guest.data('guest').color]);
      sorted[$old.attr('id')]=false;sorted[destination]=false;
      syncRoom($old);syncRoom($dest);updateCounts();
      $old.add($dest).find('.sort').text('Sort by time ↗');
      busy=false;$('body').removeClass('busy');
      $('#result-label').text('GUEST MOVED');$('#result').text($guest.attr('data-name')+' moved to '+$dest.attr('data-room-name')+'. Run a case to search the updated party.');
    });
  }
  function sortRoom($room) {
    if(busy)return;closeProfile(true);
    const id=$room.attr('id'), $guests=$room.find('.guest');
    $guests.stop(true,true).css({top:0,left:0});
    const before={};$guests.each(function(){before[$(this).attr('data-name')]=$(this).offset();});
    sorted[id]=!sorted[id];
    const order=$guests.get().sort((a,b)=>sorted[id]?$(a).attr('data-time').localeCompare($(b).attr('data-time')):$(a).data('guest').order-$(b).data('guest').order);
    $room.find('.guests').append(order);
    $guests.each(function(){const $g=$(this),after=$g.offset(),prev=before[$g.attr('data-name')];$g.css({left:prev.left-after.left,top:prev.top-after.top}).animate({left:0,top:0},400);});
    syncRoom($room);$room.find('.sort').text(sorted[id]?'Picture order ↶':'Sort by time ↗');
  }
  titles.forEach((t,i)=>{
    $('<option>',{value:i+1,text:String(i+1).padStart(2,'0')+' / '+t}).appendTo('#case');
    $('<button>',{text:i+1,'data-case':i+1,title:t}).appendTo('.case-buttons');
  });
  $('#run').on('click',()=>runCase(Number($('#case').val())));
  $('.case-buttons').on('click','button',function(){runCase(Number($(this).attr('data-case')));});
  $('#clear').on('click',function(){if(busy)return;closeProfile(true);$('.guest').stop(true,true).css({top:0,left:0}).fadeTo(300,1);$('.found').removeClass('found');$('.case-buttons button').removeClass('active');$('#result-label').text('SPOTLIGHT CLEARED');$('#result').text('All guests are bright again.');});
  $('#reset').on('click',function(){if(busy)return;party=structuredClone(INITIAL_PARTY);Object.keys(sorted).forEach(k=>delete sorted[k]);build();$('#result-label').text('PARTY RESET');$('#result').text('Original picture order restored.');$('.case-buttons button').removeClass('active');});
  $('#house').on('click','.guest',function(){openProfile($(this));}).on('click','.sort',function(){sortRoom($(this).closest('.room'));});
  $('#profile').on('click','.close',()=>closeProfile()).on('click','[data-move]',function(){moveGuest($(this).attr('data-move'));});
  $('#overlay').on('click',function(e){if(e.target===this)closeProfile();});
  $(document).on('keydown',function(e){if(e.key==='Escape')closeProfile();if(e.key==='Tab'&&activeGuest){const $b=$('#profile button'),first=$b[0],last=$b[$b.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();$(last).trigger('focus');}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();$(first).trigger('focus');}}});
  build();
});
