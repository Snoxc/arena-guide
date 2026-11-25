
			const $ = s => document.querySelector(s),
				all = s => [...document.querySelectorAll(s)]
			const chapters = all('.chapter'),
				navLinks = all('.sidebar .nav-items>a')
            // Desktop-only group collapse. Mobile always displays the entire contents.
            const desktopNav=matchMedia('(min-width: 901px)'), navSections=all('.nav-section');
            let collapsedGroups=new Set();
            try{const value=JSON.parse(localStorage.getItem('arena-nav-groups')||'[]');if(Array.isArray(value))collapsedGroups=new Set(value.filter(k=>navSections.some(g=>g.dataset.navGroup===k)))}catch{}
            function syncNavGroups(){for(const group of navSections){const closed=desktopNav.matches&&collapsedGroups.has(group.dataset.navGroup);group.classList.toggle('is-collapsed',closed);group.querySelector('.nav-group-toggle').setAttribute('aria-expanded',String(!closed));group.querySelector('.nav-items').hidden=closed;}}
            for(const group of navSections){group.querySelector('.nav-group-toggle').addEventListener('click',()=>{if(!desktopNav.matches)return;const key=group.dataset.navGroup;collapsedGroups.has(key)?collapsedGroups.delete(key):collapsedGroups.add(key);try{localStorage.setItem('arena-nav-groups',JSON.stringify([...collapsedGroups]))}catch{}syncNavGroups()})}
            arenaWatchMedia(desktopNav,syncNavGroups);syncNavGroups();
			function progress() {
				const d = document.documentElement
				$('.back-top').classList.toggle('visible', d.scrollTop > 180)
				$('#progress').style.transform = 'scaleX(' + Math.min(1,Math.max(0,d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight))) + ')'
			}
			addEventListener('scroll', progress, { passive: true })
            $('.back-top').addEventListener('click', e => {
                e.preventDefault();
                try { if(location.hash) history.replaceState(null,'',location.pathname+location.search); } catch {}
                window.scrollTo({top:0,behavior:'smooth'});
            });
			const observer = new IntersectionObserver(
				entries => {
					for (const e of entries)
						if (e.isIntersecting)
							navLinks.forEach(a => {
								const active = a.hash === '#' + e.target.id
								a.classList.toggle('active', active)
								if (active) a.setAttribute('aria-current', 'location')
								else a.removeAttribute('aria-current')
							})
				},
				{ rootMargin: '-10% 0px -70% 0px' },
			)
			;[...chapters, $('#video-guide'),...all('.feature-card')].forEach(s => observer.observe(s))
			progress();addEventListener('resize',progress,{passive:true});if('ResizeObserver' in window)new ResizeObserver(progress).observe(document.querySelector('main'));
            const theme = $('#theme')
			function applyTheme(dark) {
				document.body.classList.toggle('dark', dark)
				document.querySelector('meta[name=theme-color]').content = dark ? '#202020' : '#ffffff'
				theme.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему')
				theme.setAttribute('aria-pressed', String(dark))
				theme.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему'
			}
			try {
				applyTheme(localStorage.getItem('arena-theme') ? localStorage.getItem('arena-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
			} catch {applyTheme(matchMedia('(prefers-color-scheme: dark)').matches)}
			theme.onclick = () => {
				const dark = !document.body.classList.contains('dark')
				applyTheme(dark)
				try {
					localStorage.setItem('arena-theme', dark ? 'dark' : 'light')
				} catch {}
			}
            const search = $('#search'), results = $('#search-results'), pop = $('#search-pop'), menuTrigger = $('#menu-trigger')
            function filter(){window.arenaSearch?.();}
            search.addEventListener('input',filter);
            const panel=$('#search-panel'), toggle=$('#search-toggle'), shade=$('#search-shade');
            const searchBackground=all('.shell,.bottom-nav,.back-top,.skip');
            let searchReturn=null, menuReturn=null;
            function clearSearch(){search.value='';filter()}
            function showSearch(open, restore=true){
              if(open===!panel.hidden){if(open)search.focus({preventScroll:true});return;}
              if(open){
                menu(false,false);searchReturn=document.activeElement;
                panel.hidden=false;shade.hidden=false;document.body.classList.add('search-open');
                searchBackground.forEach(el=>el.inert=true);
                toggle.setAttribute('aria-expanded','true');filter();search.focus({preventScroll:true});
              }else{
                panel.hidden=true;pop.hidden=true;shade.hidden=true;document.body.classList.remove('search-open');
                searchBackground.forEach(el=>el.inert=false);
                toggle.setAttribute('aria-expanded','false');clearSearch();
                if(restore&&searchReturn?.isConnected)searchReturn.focus({preventScroll:true});searchReturn=null;
              }
            }
            window.navigateSearch=function navigateSearch(id){
              const target=document.getElementById(id);if(!target)return;
              showSearch(false,false);menu(false,false);
              if(location.hash!=='#'+id){try{history.pushState(null,'','#'+id)}catch{location.hash=id}}
              // Scroll only after the overlay, scroll lock and hidden results are removed.
              requestAnimationFrame(()=>{
                if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
                target.focus({preventScroll:true});
                target.scrollIntoView({block:'start',behavior:'smooth'});
              });
            }
            toggle.onclick=()=>showSearch(panel.hidden);$('#search-close').onclick=()=>showSearch(false);$('#mobile-search').onclick=()=>showSearch(true);shade.onclick=()=>showSearch(false);
            $('#reset-search').onclick=()=>{clearSearch();showSearch(true)};
            function menu(open,restore=true){const side=$('.sidebar');if(open){showSearch(false,false);menuReturn=document.activeElement;side.classList.add('open');$('#menu-shade').hidden=false;menuTrigger?.setAttribute('aria-expanded','true');$('#mobile-menu').setAttribute('aria-expanded','true');document.body.classList.add('menu-open');$('#menu-close').focus()}else{const wasOpen=side.classList.contains('open');side.classList.remove('open');$('#menu-shade').hidden=true;menuTrigger?.setAttribute('aria-expanded','false');$('#mobile-menu').setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');if(wasOpen&&restore&&menuReturn?.isConnected)menuReturn.focus();menuReturn=null}}
            menuTrigger&&(menuTrigger.onclick=()=>menu(true));$('#mobile-menu').onclick=()=>menu(true);$('#menu-close').onclick=()=>menu(false);$('#menu-shade').onclick=()=>menu(false);
            arenaWatchMedia(matchMedia('(min-width: 901px)'),e=>{if(e.matches)menu(false,false)});
            document.addEventListener('click',e=>{
              const path=e.composedPath();
              if(path.includes(panel)||path.includes(toggle)||path.includes($('#mobile-search')))return;
              const a=path.find(el=>el instanceof HTMLAnchorElement&&el.getAttribute('href')?.startsWith('#'));
              if(a){showSearch(false,false);menu(false,false)}else if(!panel.hidden)showSearch(false,false);
            });
            document.addEventListener('keydown',e=>{
              if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSearch(true);return;}
              if(e.key==='Escape'){if(!panel.hidden){e.preventDefault();showSearch(false)}else if($('.sidebar').classList.contains('open'))menu(false);return;}
              if(!panel.hidden){
                const choices=[...results.querySelectorAll('a,button')];
                if(e.key==='Enter'&&document.activeElement===search&&search.value.trim()&&results.querySelector('a')){e.preventDefault();results.querySelector('a').click();return;}
                if(e.key==='ArrowDown'||e.key==='ArrowUp'){const items=[search,...choices],i=items.indexOf(document.activeElement);if(i>=0&&items.length>1){e.preventDefault();items[(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();}return;}
                if(e.key==='Tab'){const items=[search,$('#search-close'),...choices],i=items.indexOf(document.activeElement);if(i<0||(!e.shiftKey&&i===items.length-1)||(e.shiftKey&&i===0)){e.preventDefault();items[e.shiftKey?items.length-1:0].focus();}return;}
              }
              if(e.key==='Tab'&&$('.sidebar').classList.contains('open')){const items=[...$('.sidebar').querySelectorAll('button,a')].filter(el=>el.getClientRects().length);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}}
            });
            // Keep fallback SVG icons if the external icon font cannot be loaded.
            async function enableIconFont(){
              const icons=all('.ui-icon > i.hgi');
              const fonts=new Map();
              await Promise.all(icons.map(async i=>{
                const slot=i.parentElement;
                try{
                  const style=getComputedStyle(i,'::before'), content=style.content;
                  if(!content||['none','normal','""',"''"].includes(content)){slot.classList.remove('hugeicon-ready');return;}
                  const family=style.fontFamily.split(',')[0].trim();
                  if(!fonts.has(family)) fonts.set(family,document.fonts.load('24px '+family).catch(()=>[]));
                  const loaded=await fonts.get(family);
                  slot.classList.toggle('hugeicon-ready',loaded.length>0);
                }catch{slot.classList.remove('hugeicon-ready')}
              }));
            }
            const iconStyles=$('#hugeicons-css');
            iconStyles?.addEventListener('load',enableIconFont);enableIconFont();
            // Native HLS where supported, with existing progressive MP4 as fallback.
            const videoConfig=window.ARENA_CONTENT.video;
            const video=$('#guide-video'), startVideo=$('#video-start'), videoMessage=$('#video-message'), videoRetry=$('#video-retry');
            let videoAttempt=0, videoTimer=0, restoreTime=0, hasPlayed=false, sources=[], sourceIndex=0;
            const stopVideoTimer=()=>{clearTimeout(videoTimer);videoTimer=0};
            function showVideoMessage(message,retry=false){videoMessage.textContent=message;videoRetry.hidden=!retry;}
            function watchVideoLoad(){stopVideoTimer();videoTimer=setTimeout(()=>{if(!video.error&&!video.ended&&video.readyState<3)showVideoMessage('Видео ещё загружается. На медленном соединении это может занять больше времени.',true);},15000);}
            function videoUnavailable(message){stopVideoTimer();startVideo.disabled=false;video.hidden=true;startVideo.hidden=false;showVideoMessage(message,true);}
            function videoErrorMessage(){switch(video.error?.code){case 1:return 'Загрузка прервана. Попробуйте ещё раз.';case 2:return 'Ошибка сети при загрузке видео. Проверьте соединение и повторите попытку.';case 3:return 'Браузер не смог декодировать видео.';case 4:return 'Браузер не смог открыть источник видео. Возможна проблема формата или сервера.';default:return 'Видео не удалось открыть. Попробуйте ещё раз.';}}
            function validVideoUrl(raw){
                if(!String(raw||'').trim())return null;
                try{const u=new URL(raw,location.href);return u.protocol==='https:'||(u.origin===location.origin&&u.protocol==='http:')||(u.protocol==='file:'&&location.protocol==='file:')?u.href:null;}catch{return null;}
            }
            function failVideoSource(){
                if(!hasPlayed&&sourceIndex+1<sources.length){sourceIndex++;loadVideoSource();return;}
                videoUnavailable(videoErrorMessage());
            }
            function loadVideoSource(){
                const attempt=++videoAttempt;stopVideoTimer();hasPlayed=false;
                video.hidden=false;startVideo.hidden=true;startVideo.disabled=false;
                showVideoMessage('Загружаем видео…');
                video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.playsInline=true;video.controls=true;video.preload='metadata';
                video.src=sources[sourceIndex];video.load();watchVideoLoad();
                const result=video.play();if(result&&typeof result.catch==='function')result.catch(error=>{
                    if(attempt!==videoAttempt||error.name==='AbortError')return;
                    if(error.name==='NotAllowedError'){stopVideoTimer();showVideoMessage('Нажмите ▶ в самом плеере для запуска.',true);}
                    else if(video.error){failVideoSource();}
                    else if(error.name==='NotSupportedError'){failVideoSource();}
                    else{stopVideoTimer();showVideoMessage('Не удалось начать воспроизведение. Нажмите ▶ или повторите загрузку.',true);}
                });
            }
            function playVideo(){
                stopVideoTimer();sources=[];sourceIndex=0;restoreTime=0;
                const hls=validVideoUrl(videoConfig.hlsUrl),mp4=validVideoUrl(videoConfig.url);
                const nativeHls=!!(video.canPlayType('application/vnd.apple.mpegurl')||video.canPlayType('application/x-mpegURL'));
                if(nativeHls&&hls&&location.protocol!=='file:')sources.push(hls);
                if(mp4)sources.push(mp4);
                if(!sources.length){videoUnavailable('Видео ещё подключается. Попробуйте позже.');return;}
                try{restoreTime=Number(localStorage.getItem('arena-video-time'))||0}catch{}
                loadVideoSource();
            }
            startVideo.onclick=playVideo;videoRetry.onclick=playVideo;
            video.addEventListener('error',()=>{if(video.hasAttribute('src')&&video.error)failVideoSource()});
            video.addEventListener('waiting',()=>{if(!video.paused){showVideoMessage('Буферизация видео…');watchVideoLoad()}});
            video.addEventListener('stalled',()=>{if(!video.ended){showVideoMessage('Ожидаем данные от сервера…',true);watchVideoLoad()}});
            video.addEventListener('canplay',()=>{stopVideoTimer();showVideoMessage('')});
            video.addEventListener('playing',()=>{stopVideoTimer();showVideoMessage('');if(!hasPlayed){hasPlayed=true;const t=restoreTime;restoreTime=0;if(Number.isFinite(t)&&t>0&&t<video.duration-5&&video.currentTime<2){try{video.currentTime=t}catch{}}}});
            video.addEventListener('pause',()=>{if(hasPlayed&&Number.isFinite(video.duration)&&!video.error){try{localStorage.setItem('arena-video-time',String(video.ended?0:video.currentTime))}catch{}}});

			let toastTimer
			function toast(msg) {
				$('#toast').textContent = msg
				$('#toast').classList.add('show')
				clearTimeout(toastTimer)
				toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2300)
			}
            // Share a direct chapter URL, with clipboard fallback on desktop.
            all('[data-share]').forEach(button=>button.addEventListener('click',async()=>{
              const target=document.getElementById(button.dataset.share);if(!target)return;
              const url=new URL(location.href);url.hash=target.id;
              const title=target.querySelector('h2')?.textContent.trim()||document.title;
              button.classList.remove('action-pop');void button.offsetWidth;button.classList.add('action-pop');
              if(typeof navigator.share==='function'){
                try{await navigator.share({title,url:url.href});return}catch(error){if(error?.name==='AbortError')return;}
              }
              try{await navigator.clipboard.writeText(url.href);toast('Ссылка на раздел скопирована');return}catch{}
              const field=document.createElement('textarea');field.value=url.href;field.style.cssText='position:fixed;left:0;top:0;opacity:0;pointer-events:none';document.body.append(field);field.select();
              let copied=false;try{copied=document.execCommand('copy')}catch{}finally{field.remove();button.focus({preventScroll:true})}
              if(copied)toast('Ссылка на раздел скопирована');else window.prompt('Скопируйте ссылку на раздел:',url.href);
            }));

// Touch scrolling feedback for the sidebar (no hover required).
{const sidebar=document.querySelector('.sidebar');let scrollTimer;sidebar.addEventListener('scroll',()=>{sidebar.classList.add('is-scrolling');clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>sidebar.classList.remove('is-scrolling'),850)},{passive:true});}
