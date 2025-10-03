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

interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
}

interface CollaborationState{
  manager: CollaborationManager|null;
  isConnected: boolean;
  isSynced:boolean;
  onlineUsers:CollaborationUser[];
  messages:ChatMessage[];
  initCollaboration:(option:any)=>void;
  sendMessage:(message:string)=>void;
  // updateCursor:(position:any)=>void;
  // updateSelection:(selection:any)=>void;
  destroy:()=>void;
}

export const useCollaborationStore = create<CollaborationState>((set,get)=>({
  manager: null,
  isConnected:false,
  isSynced:false,
  onlineUsers:[],
  messages:[],

  initCollaboration:(options)=>{
    const manager = new CollaborationManager(options);

    setInterval(() => {
      const users = manager.getOnlineUsers();
      set({onlineUsers:users})
    }, (1000));

    manager.onMessage((messages)=>{
      set({messages});
    })

    set({manager,isConnected:true});
  },

  sendMessage:(message)=>{
    const {manager} = get();
    manager?.sendMessage(message);
  },

  // updateCursor:(position)=>{
  //   const {manager} = get();
  //   // TODO: 实现光标位置更新逻辑
  //   if(manager && position) {
  //     // manager.updateCursor(position);
  //   }
  // },

  // updateSelection:(selection)=>{
  //   const {manager} = get();
  //   // TODO: 实现选区更新逻辑
  //   if(manager && selection) {
  //     // manager.updateSelection(selection);
  //   }
  // },

  destroy:()=>{
    const {manager} = get();
    manager?.destroy();
    set({
      manager:null,
      isConnected:false,
      onlineUsers:[],
      messages:[]
    })
  }
}))