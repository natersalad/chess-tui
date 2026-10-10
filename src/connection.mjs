// Supported live transport is unavailable until Chess.com grants access and docs.
export const approvalForm='https://docs.google.com/forms/d/e/1FAIpQLSds2AeKLj9xqgu96Pu-rEAS0ItyqDbZbSgUFer0Mo6qMRx4Jg/viewform';
export const approvalHelp='https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it';
export class PendingApprovalConnection{
 constructor(){this.pendingApproval=true;this.connected=false;this.snapshot=null;this.config={};this.status='Chess.com access approval required';}
 async start(){return this;}
 async command(){return {ok:false,error:'Approved Chess.com live-play access is required. See Browser setup.'};}
 async close(){}
}
