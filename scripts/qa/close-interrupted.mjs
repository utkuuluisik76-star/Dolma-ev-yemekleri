// Only the fixed ports reserved by this project's Lighthouse script, and only if the
// target is this project's loopback preview. Never close the person's normal browser.
for(const port of [9241,9242,9243,9244,9245]){
  try{
    const tabs=await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(500)}).then(r=>r.json());
    if(!tabs.some(t=>/^http:\/\/(?:localhost|127\.0\.0\.1):4182\//.test(t.url)))continue;
    const version=await fetch(`http://127.0.0.1:${port}/json/version`).then(r=>r.json());
    const socket=new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
    socket.send(JSON.stringify({id:1,method:'Browser.close'}));
    console.log(`Closed interrupted project audit on ${port}.`);
  }catch{}
}
