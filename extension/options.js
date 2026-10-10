const token=document.querySelector('#token'),status=document.querySelector('#status');
chrome.storage.local.get('token').then(c=>{token.value=c.token||'';});
document.querySelector('#pair').onclick=async()=>{if(!/^[a-f0-9]{64}$/.test(token.value)){status.textContent='Paste the 64-character token copied from the terminal.';return;}await chrome.storage.local.set({token:token.value});await chrome.runtime.sendMessage({type:'reconnect'});status.textContent='Pairing saved. Keep chess running; bind your Chess.com tab via the extension icon.';};
document.querySelector('#clear').onclick=async()=>{await chrome.storage.local.remove(['token','boundTab']);token.value='';status.textContent='Pairing removed.';};
