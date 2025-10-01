import {create } from 'zustand';
import { CollaborationManager } from '../pages/editor/class/collaboration';

interface CollaborationUser{
  id:string;
  name:string;
  color:string;
  cursor?:{
    line: number;
    column: number;
  };
  selection?:{
    startLine:number;
    startColumn:number;
    endLine:number;
    endColum:number;
  }
}

interface CollaborationState{
  manager: CollaborationManager|null;
  isConnected: boolean;
  isSynced:boolean;
  onlineUsers:CollaborationUser[];
  // messages:ChatMessage[];
  initCollaboration:(option:any)=>void;
  sendMessage:(message:string)=>void;
  updateCursor:(position:any)=>void;
  updateSelection:(selection:any)=>void;
  destroy:()=>void;
}