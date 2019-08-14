[1mdiff --git a/cypress/integration/integration.js b/cypress/integration/integration.js[m
[1mindex 4c43b14..af7a32b 100644[m
[1m--- a/cypress/integration/integration.js[m
[1m+++ b/cypress/integration/integration.js[m
[36m@@ -21,7 +21,7 @@[m [mdescribe("collisions", function(){[m
 [m
     cy.window({timeout: 15000}).its("player.speed").should("to.eq", 50);[m
 [m
[31m-    cy.wait(3000); // 1 sec before qc[m
[32m+[m[32m    cy.wait(3100); // 1 sec before qc[m
 [m
     //cy.wait(4100); // for qc + 100ms[m
 [m
[36m@@ -60,6 +60,8 @@[m [mdescribe("collisions", function(){[m
     cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});[m
     cy.wait(tm_wait);[m
 [m
[32m+[m[32m    cy.wait(60000);[m
[32m+[m
   })[m
 [m
 })[m
[1mdiff --git a/lobby.js b/lobby.js[m
[1mindex 8aae7a2..e840cd7 100644[m
[1m--- a/lobby.js[m
[1m+++ b/lobby.js[m
[36m@@ -65,7 +65,7 @@[m [mGame.prototype.collisionDetected = function(player_state, collision_tm, type, pa[m
     player_state.speed = 0;[m
     player_state.collision_tm = 0;[m
     player_state.killed = true;[m
[31m-    this.emitKilled(player_state.name, player_state.collision_before_input.collision_tm, player_state.collision_before_input.path_at_collision, true); //4th arg true due to force[m
[32m+[m[32m    this.emitKilled(player_state, player_state.collision_before_input.collision_tm, player_state.collision_before_input.path_at_collision, true); //4th arg true due to force[m
     if(player_state.name=="user6")[m
       console.log("collision emmitted(forced): " + collision_tm);[m
     return;[m
[36m@@ -82,7 +82,7 @@[m [mGame.prototype.collisionDetected = function(player_state, collision_tm, type, pa[m
       player_state.speed = 0;[m
       player_state.collision_tm = 0;[m
       player_state.killed = true;[m
[31m-      this.emitKilled(player_state.name, collision_tm, player_state.path_at_collision);[m
[32m+[m[32m      this.emitKilled(player_state, collision_tm, player_state.path_at_collision);[m
       if(player_state.name=="user6")[m
         console.log("collision emmitted: " + collision_tm);[m
     }[m
[36m@@ -97,13 +97,15 @@[m [mGame.prototype.collisionDetected = function(player_state, collision_tm, type, pa[m
   }, 250);[m
 }[m
 [m
[31m-Game.prototype.emitKilled = function(playername, collision_tm, path_at_collision, forced){[m
[32m+[m[32mGame.prototype.emitKilled = function(player_state, collision_tm, path_at_collision, forced){[m
[32m+[m
[32m+[m[32m  var playername = player_state.name;[m
 [m
   // forced[m
   // done path in history of paths covers path_before_input (strictly curpath head).[m
   // when input caused reseting, and then collision was detected again, input caused also save of path. path before input is actually equivalent path.[m
 [m
[31m-  io.to(this.name).emit("killed", playername, collision_tm, path_at_collision, forced);[m
[32m+[m[32m  io.to(this.name).emit("killed", playername, collision_tm, path_at_collision, forced, player_state.paths);[m
 [m
   for( var player of this.players){[m
 [m
[36m@@ -357,6 +359,21 @@[m [mGame.prototype.start = function(){[m
           player_state_item.recomputeCurpath( input.tm );[m
           var state_of_curpath = player_state_item.getCurpath();[m
           var done_path = player_state_item.changeDir(input.dir, input.tm);[m
[32m+[m[32m          if(player_state_item.name=="user6"){[m
[32m+[m[32m            console.log("***");[m
[32m+[m[32m            console.log(done_path);[m
[32m+[m[32m            if(done_path.body.vertices){[m
[32m+[m[32m              console.log(done_path.body.vertices[0])[m
[32m+[m[32m              console.log(done_path.body.vertices[1])[m
[32m+[m[32m              console.log(done_path.body.vertices[2])[m
[32m+[m[32m              console.log(done_path.body.vertices[3])[m
[32m+[m[32m            }[m
[32m+[m[32m            if(done_path.body.line){[m
[32m+[m[32m              console.log(done_path.body.line[0]);[m
[32m+[m[32m              console.log(done_path.body.line[1]);[m
[32m+[m[32m            }[m
[32m+[m[32m            console.log("***")[m
[32m+[m[32m          }[m
           if(!input.discard_save){[m
             player_state_item.savePath(done_path, true);[m
           }[m
[36m@@ -488,26 +505,26 @@[m [mmodule.exports = function( io_, socket ){[m
 [m
   io = io_;[m
 [m
[31m-  socket.on("left", function(tm){[m
[32m+[m[32m  socket.on("left", function(tm, processed_lag_vector){[m
 [m
     setTimeout( ()=>{[m
[31m-      socket.player_state.changeDirSrv("left", tm);[m
[32m+[m[32m      socket.player_state.changeDirSrv("left", tm, processed_lag_vector);[m
     }, 400)[m
 [m
   })[m
 [m
[31m-  socket.on("right", function(tm){[m
[32m+[m[32m  socket.on("right", function(tm, processed_lag_vector){[m
 [m
     setTimeout( ()=>{[m
[31m-      socket.player_state.changeDirSrv("right", tm);[m
[32m+[m[32m      socket.player_state.changeDirSrv("right", tm, processed_lag_vector);[m
     }, 400)[m
 [m
   })[m
 [m
[31m-  socket.on("straight", function(tm){[m
[32m+[m[32m  socket.on("straight", function(tm, processed_lag_vector){[m
 [m
     setTimeout( ()=>{[m
[31m-      socket.player_state.changeDirSrv("straight", tm);[m
[32m+[m[32m      socket.player_state.changeDirSrv("straight", tm, processed_lag_vector);[m
     }, 400)[m
 [m
   })[m
[1mdiff --git a/src/Game.vue b/src/Game.vue[m
[1mindex f07ac50..bb34483 100644[m
[1m--- a/src/Game.vue[m
[1m+++ b/src/Game.vue[m
[36m@@ -83,25 +83,10 @@[m
 [m
           if(player_item.name!=player_me.name){[m
 [m
[31m-            // @TODO ... gamestate.player_consideration == false na biezaca date[m
             // handle input triggered before qc, when qc is already active[m
             if(gamestate.player_consideration == false && tm<gamestate.tm_quit_consideration){[m
 [m
[31m-              //apply first path before qc[m
[31m-[m
[31m-              player_item.clearFurtherPaths(gamestate.tm_quit_consideration, true);[m
[31m-              player_item.applyStartPoitOfCurpathState(player_item.path_before_qc);[m
[31m-[m
[31m-              player_item.inputs.push({[m
[31m-                type: "input",[m
[31m-                dir: newdir,[m
[31m-                tm: tm,[m
[31m-                done_path: done_path,[m
[31m-                discard_save: true[m
[31m-              });[m
[31m-              player_item.inputs.push({[m
[31m-                type: "quit_consideration"[m
[31m-              })[m
[32m+[m[32m              this.injectPathBeforeQc(input.tm, input.dir);[m
 [m
             }[m
             else {[m
[36m@@ -155,7 +140,7 @@[m
       if(player_me.speed==0){[m
         return;[m
       }[m
[31m-      player_me.proccesInput(io, "left");[m
[32m+[m[32m      player_me.processInput(io, "left");[m
     }[m
 [m
     left.release = function(){[m
[36m@@ -163,7 +148,7 @@[m
         if(player_me.speed==0){[m
           return;[m
         }[m
[31m-        player_me.proccesInput(io, "straight");[m
[32m+[m[32m        player_me.processInput(io, "straight");[m
       }[m
     }[m
 [m
[36m@@ -171,7 +156,7 @@[m
       if(player_me.speed==0){[m
         return;[m
       }[m
[31m-      player_me.proccesInput(io, "right");[m
[32m+[m[32m      player_me.processInput(io, "right");[m
     }[m
 [m
     right.release = function(){[m
[36m@@ -179,10 +164,11 @@[m
         if(player_me.speed==0){[m
           return;[m
         }[m
[31m-        player_me.proccesInput(io, "straight");[m
[32m+[m[32m        player_me.processInput(io, "straight");[m
      }[m
     }[m
 [m
[32m+[m
   }[m
 [m
   module.exports = {[m
[36m@@ -402,18 +388,21 @@[m
 [m
       })[m
 [m
[31m-      this.$io.on("killed", (playername, collision_tm, path_at_collision, forced)=>{[m
[32m+[m[32m      this.$io.on("killed", (playername, collision_tm, path_at_collision, forced, paths)=>{[m
[32m+[m
[32m+[m
 [m
         for(var player of players){[m
           if(player.name ==  playername){[m
[31m-[m
[32m+[m[32m            console.log("???");[m
[32m+[m[32m            console.log(paths);[m
[32m+[m[32m            console.log(player_me.paths);[m
             player.inputs.push({[m
               type: "killed",[m
               collision_tm: collision_tm,[m
               path_at_collision: path_at_collision,[m
               forced: forced[m
             });[m
[31m-[m
             return;[m
           }[m
         }[m
[36m@@ -481,13 +470,12 @@[m
             var input = player_item.inputs.shift();[m
 [m
             if(input.type == "reduction"){[m
[31m-              player_item.reduction(input.from, input.to, input.id, player_item);[m
[32m+[m[32m              player_item.reduction(input.from, input.to, input.id);[m
             }[m
             else if(input.type == "quit_consideration"){[m
               player_item.quitConsideation(this.game_state.tm_quit_consideration, false);[m
             }[m
             else if(input.type == "killed"){[m
[31m-[m
               player_item.clearFurtherPaths(input.collision_tm, false, input.forced);[m
               player_item.applyCurpathState(input.path_at_collision);[m
               player_item.speed = 0;[m
[1mdiff --git a/src/game/Player.js b/src/game/Player.js[m
[1mindex 95220cf..9a0a0a0 100644[m
[1m--- a/src/game/Player.js[m
[1m+++ b/src/game/Player.js[m
[36m@@ -32,6 +32,9 @@[m [mvar Player = function(initial_state){[m
   this.collision_participant = null;[m
   this.id_cnt = 0;[m
   this.id_cnt_srv = 0;[m
[32m+[m[32m  this.id_path_before_qc = null;[m
[32m+[m[32m  this.processed_lag_vector = 0;[m
[32m+[m[32m  this.unprocessed_lag_vector = 0; //srv[m
   this.curpath = {[m
     id: 0,[m
     after_qc: false,[m
[36m@@ -177,16 +180,28 @@[m [mPlayer.prototype.createPath2 = function(path_state){[m
 // used for reduction[m
 Player.prototype.overwritePath = function(path_state_new, index){[m
 [m
[31m-  var path = this.createPath2(path_state_new);[m
[32m+[m[32m  var path = {};[m
[32m+[m[32m  if(this.srv!=true){[m
[32m+[m[32m    path = this.createPath2(path_state_new);[m
[32m+[m[32m  }[m
   path.body = path_state_new.body;[m
 [m
[31m-  //console.log(this.paths[index].body);[m
[31m-  //console.log(path_state_new.body);[m
[31m-[m
   this.paths[index] = path;[m
 [m
 }[m
 [m
[32m+[m[32mPlayer.prototype.splicePath = function(path_state_new, index){[m
[32m+[m
[32m+[m[32m  var path = {};[m
[32m+[m[32m  if(this.srv!=true){[m
[32m+[m[32m    path = this.createPath2(path_state_new);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  path.body = path_state_new.body;[m
[32m+[m
[32m+[m[32m  this.paths.splice(index, 0, path);[m
[32m+[m[32m}[m
[32m+[m
 Player.prototype.savePath = function(path_state, server_side, reconciled_path) {[m
 [m
   // path_state is path with body[m
[36m@@ -379,11 +394,23 @@[m [mPlayer.prototype.changeDir = function(new_dir, tm){[m
 [m
   // All paths are saved in paths history (also these before qc)[m
   var path = this.getPathBodyFromCurpath(this.curpath);[m
[31m-  this.id_cnt++;[m
[31m-  this.curpath.id = this.id_cnt;[m
 [m
[31m-  this.setInitPositionForCurpath(new_dir, tm );[m
[32m+[m[32m  if(tm=="qc"){[m
[32m+[m[32m    this.curpath.id = "qc";[m
[32m+[m[32m    tm = this.game_state.tm_quit_consideration;[m
[32m+[m[32m  }[m
[32m+[m[32m  else{[m
[32m+[m[32m    this.id_cnt++;[m
[32m+[m[32m    this.curpath.id = this.id_cnt;[m
[32m+[m[32m  }[m
 [m
[32m+[m[32m  this.setInitPositionForCurpath(new_dir, tm );[m
[32m+[m[32m  if(this.name=="user6"){[m
[32m+[m[32m    console.log("****")[m
[32m+[m[32m    console.log(this.curpath.tm);[m
[32m+[m[32m    console.log(this.curpath.base_start_angle);[m
[32m+[m[32m    console.log("****")[m
[32m+[m[32m  }[m
   return path;[m
 }[m
 [m
[36m@@ -462,6 +489,8 @@[m [mPlayer.prototype.recomputeCurpath = function(tm_to_timestep, curpath){[m
       curpath = this.curpath;[m
     }[m
 [m
[32m+[m[32m    curpath.tm_to = tm_to_timestep;[m
[32m+[m
     /*[m
      set end to start before recomputing[m
     */[m
[36m@@ -545,6 +574,7 @@[m [mPlayer.prototype.getCurpath = function(){[m
   obj.end_y = this.curpath.end.y;[m
   obj.angle = this.curpath.angle;[m
   obj.starting_angle = this.curpath.starting_angle;[m
[32m+[m[32m  obj.base_start_angle = this.curpath.base_start_angle;[m
   obj.arc_point_x = this.curpath.arc_point.x;[m
   obj.arc_point_y = this.curpath.arc_point.y;[m
   obj.dir = this.curpath.dir;[m
[36m@@ -564,6 +594,7 @@[m [mPlayer.prototype.applyCurpathState = function(state_of_curpath){[m
   this.curpath.end.y = state_of_curpath.end_y  ;[m
   this.curpath.angle = state_of_curpath.angle  ;[m
   this.curpath.starting_angle = state_of_curpath.starting_angle  ;[m
[32m+[m[32m  this.curpath.base_start_angle = state_of_curpath.base_start_angle  ;[m
   this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;[m
   this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;[m
   this.curpath.dir = state_of_curpath.dir;[m
[36m@@ -581,6 +612,7 @@[m [mPlayer.prototype.applyStartPoitOfCurpathState = function(state_of_curpath){[m
   this.curpath.end.y = state_of_curpath.start_y  ;[m
   this.curpath.angle = state_of_curpath.starting_angle  ;[m
   this.curpath.starting_angle = state_of_curpath.starting_angle  ;[m
[32m+[m[32m  this.curpath.base_start_angle = state_of_curpath.base_start_angle  ;[m
   this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;[m
   this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;[m
   this.curpath.dir = state_of_curpath.dir;[m
[36m@@ -602,19 +634,40 @@[m [mPlayer.prototype.getPos = function(){[m
 [m
 }[m
 [m
[32m+[m[32mPlayer.prototype.injectPathBeforeQc = function(tm_to, dir){[m
[32m+[m
[32m+[m[32m  var tm_qc = this.game_state.tm_quit_consideration;[m
[32m+[m
[32m+[m[32m  var working_curpath = this.extendPath(this.id_path_before_qc, tm_to);[m
[32m+[m
[32m+[m[32m  this.setInitPositionForCurpath(dir, tm_to, working_curpath, this.id_path_before_qc+1);[m
[32m+[m[32m  this.recomputeCurpath(tm_qc, working_curpath );[m
[32m+[m[32m  var injected_path = this.getPathBodyFromCurpath(working_curpath);[m
[32m+[m[32m  this.splicePath(injected_path, this.id_path_before_qc+1);[m
[32m+[m
[32m+[m[32m  this.id_path_before_qc = this.id_path_before_qc+1;[m
[32m+[m[32m  this.path_before_qc = working_curpath;[m
[32m+[m
[32m+[m[32m  this.setInitPositionForCurpath(dir, tm_qc, working_curpath, "qc" );[m
[32m+[m[32m  this.recomputeCurpath(Date.now(), working_curpath);[m
[32m+[m[32m  this.assignCurpath(this.curpath, working_curpath);[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
 Player.prototype.quitConsideation = function(tm, server){[m
 [m
   // Save curpath for case when new input that occured before quit consideration arrive.[m
 [m
   this.recomputeCurpath(tm);[m
 [m
[32m+[m[32m  this.id_path_before_qc = this.curpath.id;[m
   this.path_before_qc = this.getCurpath();[m
 [m
[32m+[m[32m  tm = "qc";[m
[32m+[m
   var path = this.changeDir(this.curpath.dir, tm);[m
   this.savePath(path, server, false);[m
 [m
[31m-  this.id_cnt_srv++[m
[31m-[m
   this.breakout = false;[m
 [m
   this.game_state.player_consideration = false;[m
[36m@@ -649,52 +702,142 @@[m [mPlayer.prototype.clearFurtherPaths = function(tm, include, pop_last){[m
 [m
 }[m
 [m
[31m-Player.prototype.reduction = function(from, to, id,  player_me){[m
[32m+[m[32mPlayer.prototype.outPathsTmBefore = function(){[m
 [m
[31m-  console.log("REDUCTION; from: " + from + " to: " + to + " id: " + id );[m
[32m+[m[32m  this.arr_tm_before = [];[m
 [m
[31m-  /* bad idea[m
[31m-  var tm_elapsed = Date.now() - this.reduction.last_call;[m
[31m-  if( tm_elapsed < 250){[m
[32m+[m[32m  for(var path of this.paths){[m
[32m+[m[32m    var path_body = path.body;[m
[32m+[m[32m    this.arr_tm_before.push(path_body.tm);[m
[32m+[m[32m  }[m
 [m
[31m-    this.reduction.last_call = Date.now() + (250 - tm_elapsed);[m
[32m+[m[32m}[m
 [m
[31m-    setTimeout(()=>{[m
[31m-      this.reduction(from, to, id, player_me);[m
[31m-    }, this.reduction.last_call - Date.now() );[m
[32m+[m[32mPlayer.prototype.outPathsTmAfter = function(){[m
 [m
[31m-    return;[m
[32m+[m[32m  this.arr_tm_after = [];[m
 [m
[32m+[m[32m  for(var path of this.paths){[m
[32m+[m[32m    var path_body = path.body;[m
[32m+[m[32m    this.arr_tm_after.push(path_body.tm);[m
   }[m
[31m-  else{[m
[31m-    this.reduction.last_call = Date.now();[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mPlayer.prototype.compareArrsTm = function(lag_vector){[m
[32m+[m
[32m+[m[32m  var tm_qc = this.game_state.tm_quit_consideration;[m
[32m+[m[32m  var ix_for_after = 0;[m
[32m+[m[32m  var ix_for_before = 0;[m
[32m+[m
[32m+[m[32m  for(var i = 0; i<this.arr_tm_after.length; i++){[m
[32m+[m
[32m+[m[32m    if(this.arr_tm_after[ix_for_after] == tm_qc){[m
[32m+[m[32m      ix_for_after++;[m
[32m+[m[32m      continue;[m
[32m+[m[32m    }[m
[32m+[m[32m    if(this.arr_tm_before[ix_for_before] == tm_qc){[m
[32m+[m[32m      ix_for_before++;[m
[32m+[m[32m      continue;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if(this.arr_tm_before[ix_for_before]+lag_vector == this.arr_tm_after[ix_for_after])[m
[32m+[m[32m    {[m
[32m+[m[32m      console.log("OK");[m
[32m+[m[32m    }[m
[32m+[m[32m    else{[m
[32m+[m[32m      console.log("BREAK AT " + ix_for_before + " : " + ix_for_after);[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    ix_for_before++;[m
[32m+[m[32m    ix_for_after++;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  console.log(this.arr_tm_after);[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
[32m+[m
[32m+[m
[32m+[m[32mPlayer.prototype.mergePathOnQc = function(){[m
[32m+[m
[32m+[m[32m  //precisely merged are id_path_before_qc and qc path[m
[32m+[m
[32m+[m[32m  //remove qc path[m
[32m+[m[32m  this.paths.splice(this.id_path_before_qc+1, 1);[m
[32m+[m[32m  //extend path before qc to take place of previously removed path[m
[32m+[m[32m  this.extendPath(this.id_path_before_qc, "next");[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mPlayer.prototype.splitPathForQc = function(ix, working_curpath, to){[m
[32m+[m
[32m+[m[32m  var working_curpath;[m
[32m+[m[32m  var tm_qc = this.game_state.tm_quit_consideration;[m
[32m+[m[32m  if(!working_curpath){[m
[32m+[m
[32m+[m[32m    //working_curpath = ...[m
   }[m
[31m-  */[m
 [m
[32m+[m[32m  this.recomputeCurpath(tm_qc, working_curpath );[m
[32m+[m[32m  var path = this.getPathBodyFromCurpath(working_curpath);[m
[32m+[m[32m  this.overwritePath(path, ix);[m
 [m
[32m+[m[32m  working_curpath.id = "qc";[m
[32m+[m[32m  this.id_path_before_qc = ix;[m
[32m+[m
[32m+[m[32m  this.setInitPositionForCurpath(working_curpath.dir, tm_qc, working_curpath  );[m
[32m+[m[32m  this.recomputeCurpath(to, working_curpath );[m
[32m+[m[32m  path = this.getPathBodyFromCurpath(working_curpath);[m
[32m+[m[32m  this.splicePath(path, ix+1);[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mPlayer.prototype.extendPath = function(ix, to, vector){[m
[32m+[m
[32m+[m[32m  if(to=="next"){[m
[32m+[m[32m    to = this.paths[ix+1].body.tm;[m
[32m+[m[32m    if(vector){[m
[32m+[m[32m      to+=vector;[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  var path = this.paths[ix];[m
[32m+[m[32m  var curpath_for_extension = this.getCurpathFromPathBody(path);[m
[32m+[m[32m  this.recomputeCurpath(to, curpath_for_extension );[m
[32m+[m[32m  var new_extended = this.getPathBodyFromCurpath(curpath_for_extension);[m
[32m+[m[32m  this.overwritePath(new_extended, ix);[m
[32m+[m
[32m+[m[32m  return curpath_for_extension;[m
[32m+[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// id = id of shortended aka first shifted[m
[32m+[m[32mPlayer.prototype.reduction = function(from, to, id){[m
[32m+[m
[32m+[m[32m  console.log("REDUCTION; from: " + from + " to: " + to + " id: " + id );[m
[32m+[m
[32m+[m[32m  this.outPathsTmBefore();[m
[32m+[m
[32m+[m[32m  var working_curpath;[m
 [m
   var lag_vector = to - from;[m
 [m
   var path_extended = null;[m
   var index_of_extended = -1;[m
 [m
[31m-  // if(from < this.game_state.tm_quit_consideration ){[m
[31m-  //[m
[31m-  // }[m
[31m-[m
[31m-[m
   // search paths, case when path_shortened is curpath[m
[31m-  if(player_me.curpath.id == id){[m
[31m-    path_extended = player_me.paths[player_me.paths.length-1];[m
[31m-    index_of_extended = player_me.paths.length-1;[m
[32m+[m[32m  if(this.curpath.id == id){[m
[32m+[m[32m    path_extended = this.paths[this.paths.length-1];[m
[32m+[m[32m    index_of_extended = this.paths.length-1;[m
   }[m
 [m
   //search paths, case when path_shortened is in paths history[m
   else{[m
[31m-    for(var i = player_me.paths.length-1; i>=0; i--){[m
[31m-      var path = player_me.paths[i];[m
[32m+[m[32m    for(var i = this.paths.length-1; i>=0; i--){[m
[32m+[m[32m      var path = this.paths[i];[m
       if(path.body.id == id){[m
[31m-        path_extended = player_me.paths[i-1];[m
[32m+[m[32m        path_extended = this.paths[i-1];[m
         index_of_extended = i-1;[m
         break;[m
       }[m
[36m@@ -704,51 +847,101 @@[m [mPlayer.prototype.reduction = function(from, to, id,  player_me){[m
   if(path_extended == null){[m
     console.log("pe");[m
     console.log(id);[m
[31m-    console.log(player_me.paths);[m
[32m+[m[32m    console.log(this.paths);[m
   }[m
 [m
[32m+[m[32m  var tm_qc = this.game_state.tm_quit_consideration;[m
[32m+[m[32m  var new_extended;[m
   // Extension and swap of path designed to extension[m
[31m-  var curpath_for_extended = player_me.getCurpathFromPathBody(path_extended);[m
 [m
[31m-  player_me.recomputeCurpath(to, curpath_for_extended );[m
[31m-  var new_extended = player_me.getPathBodyFromCurpath(curpath_for_extended);[m
[31m-  player_me.overwritePath(new_extended, index_of_extended);[m
[32m+[m[32m  if(from<tm_qc && to>tm_qc){[m
[32m+[m
[32m+[m[32m    //merge previous qc path and path before qc[m
[32m+[m[32m    if(this.id_path_before_qc != null){[m
[32m+[m[32m      this.mergePathOnQc();[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    working_curpath = this.extendPath(index_of_extended, tm_qc);[m
[32m+[m
[32m+[m[32m    working_curpath.id = "qc";[m
[32m+[m[32m    this.id_path_before_qc = index_of_extended;[m
[32m+[m
[32m+[m[32m    this.setInitPositionForCurpath(working_curpath.dir, tm_qc, working_curpath  );[m
[32m+[m[32m    this.recomputeCurpath(to, working_curpath );[m
[32m+[m[32m    new_extended = this.getPathBodyFromCurpath(working_curpath);[m
[32m+[m[32m    this.splicePath(new_extended, index_of_extended+1);[m
[32m+[m[32m    index_of_extended++;[m
[32m+[m[32m  }[m
[32m+[m[32m  else{[m
[32m+[m[32m    working_curpath = this.extendPath(index_of_extended, to);[m
[32m+[m[32m  }[m
 [m
   //shift following paths[m
[31m-  var working_curpath = curpath_for_extended;[m
   var new_tm = to;[m
 [m
[31m-  for(var i = index_of_extended+1; i<player_me.paths.length; i++){[m
[32m+[m[32m  var index_before = 0;[m
[32m+[m
[32m+[m[32m  for(var i = index_of_extended+1; i<this.paths.length; i++){[m
 [m
     console.log("SHIFTING");[m
[31m-    console.log("shifting " + i + " to " + (player_me.paths.length-1));[m
[32m+[m[32m    console.log("shifting " + i + " to " + (this.paths.length-1));[m
 [m
[32m+[m[32m    if(i>this.id_path_before_qc){[m
[32m+[m[32m      index_before = -1;[m
[32m+[m[32m    }[m
 [m
[31m-    var tm_lenght; // we get tm of following path as lenght[m
[31m-    if(i+1 == player_me.paths.length){[m
[31m-      tm_lenght = player_me.curpath.tm + lag_vector;[m
[32m+[m[32m    if(i-1 == this.id_path_before_qc){[m
[32m+[m[32m      // only extend, this path is qc path[m
[32m+[m[32m      working_curpath = this.extendPath(i, "next", lag_vector);[m
[32m+[m[32m      new_tm = working_curpath.tm_to;[m
[32m+[m[32m      continue;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    var new_shortended;[m
[32m+[m
[32m+[m[32m    // we get tm of following path as to (tm)[m
[32m+[m[32m    if(i+1 == this.paths.length){ // this case is unreachable but test needed[m
[32m+[m[32m      to = this.curpath.tm + lag_vector;[m
     }[m
     else{[m
[31m-      var tm_lenght = player_me.paths[i+1].body.tm + lag_vector;[m
[32m+[m[32m      to = this.paths[i+1].body.tm + lag_vector;[m
     }[m
 [m
[31m-    var path_body = player_me.paths[i].body;[m
[31m-    player_me.setInitPositionForCurpath(path_body.dir, new_tm, working_curpath, path_body.id );[m
[31m-    player_me.recomputeCurpath(tm_lenght, working_curpath );[m
[31m-    var new_shortended = player_me.getPathBodyFromCurpath(working_curpath);[m
[31m-    player_me.overwritePath(new_shortended, i);[m
[32m+[m[32m    var path_body = this.paths[i].body;[m
[32m+[m[32m    from = new_tm;[m
 [m
[31m-    new_tm = tm_lenght;[m
[32m+[m[32m    if(from<tm_qc && to>tm_qc){[m
[32m+[m
[32m+[m[32m      //merge previous qc path and path before qc[m
[32m+[m[32m      if(this.id_path_before_qc != null){[m
[32m+[m[32m        this.mergePathOnQc();[m
[32m+[m[32m      }[m
[32m+[m[32m      this.setInitPositionForCurpath(path_body.dir, new_tm, working_curpath, path_body.id );[m
[32m+[m[32m      this.splitPathForQc(i, working_curpath, to);[m
[32m+[m[32m      new_tm = to;[m
[32m+[m[32m    }[m
[32m+[m[32m    else{[m
[32m+[m[32m      this.setInitPositionForCurpath(path_body.dir, new_tm, working_curpath, path_body.id );[m
[32m+[m[32m      this.recomputeCurpath(to, working_curpath );[m
[32m+[m[32m      new_shortended = this.getPathBodyFromCurpath(working_curpath);[m
[32m+[m[32m      this.overwritePath(new_shortended, i);[m
[32m+[m[32m      new_tm = to;[m
[32m+[m[32m  }[m
 [m
   }[m
 [m
   //shift actual curpath[m
[31m-  player_me.setInitPositionForCurpath(player_me.curpath.dir, new_tm, working_curpath, player_me.curpath.id );[m
[31m-  player_me.recomputeCurpath(Date.now(), working_curpath);[m
[31m-  player_me.assignCurpath(player_me.curpath, working_curpath);[m
[32m+[m[32m  this.setInitPositionForCurpath(this.curpath.dir, new_tm, working_curpath, this.curpath.id );[m
[32m+[m[32m  this.recomputeCurpath(Date.now(), working_curpath);[m
[32m+[m[32m  this.assignCurpath(this.curpath, working_curpath);[m
 [m
   console.log("_________________________");[m
 [m
[32m+[m[32m  this.outPathsTmAfter();[m
[32m+[m[32m  this.compareArrsTm(lag_vector);[m
[32m+[m
[32m+[m[32m  this.processed_lag_vector += lag_vector;[m
[32m+[m
 [m
 }[m
 [m
[36m@@ -778,12 +971,17 @@[m [mPlayer.prototype.processInput = function(_io, dir){[m
     dir: dir,[m
     tm: tm[m
   })[m
[31m-  _io.emit(dir, tm);[m
[32m+[m[32m  if(this.processed_lag_vector!=0){[m
[32m+[m[32m    _io.emit(dir, tm, this.processed_lag_vector);[m
[32m+[m[32m    this.processed_lag_vector = 0;[m
[32m+[m[32m  }[m
[32m+[m[32m  else{[m
[32m+[m[32m    _io.emit(dir, tm);[m
[32m+[m[32m  }[m
 [m
 }[m
 [m
 var random = require("random-js")();[m
 [m
 [m
[31m-[m
 module.exports = Player;[m
[1mdiff --git a/src/game/PlayerSrv.js b/src/game/PlayerSrv.js[m
[1mindex e9a446f..91fda1c 100644[m
[1m--- a/src/game/PlayerSrv.js[m
[1m+++ b/src/game/PlayerSrv.js[m
[36m@@ -2,19 +2,33 @@[m
 var Player = require("./Player.js");[m
 var random = require("random-js")();[m
 [m
[31m-Player.prototype.changeDirSrv = function(newdir, tm){[m
[32m+[m[32mPlayer.prototype.srv = true;[m
[32m+[m
[32m+[m[32mPlayer.prototype.changeDirSrv = function(newdir, tm, processed_lag_vector){[m
 [m
   if(this.killed==true)[m
     return;[m
 [m
[32m+[m
   this.id_cnt_srv++;[m
 [m
[32m+[m[32m  if(processed_lag_vector>0){[m
[32m+[m[32m    this.unprocessed_lag_vector-=processed_lag_vector;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  if(this.unprocessed_lag_vector>0){[m
[32m+[m[32m    tm += this.unprocessed_lag_vector;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m
[32m+[m
   var input = {[m
     dir: newdir,[m
     tm: tm,[m
     breakout: -1,[m
   }[m
 [m
[32m+[m
   // Collision test should be performed every 10px (player weight)[m
   //  1000[1s] / (50[px/s]/10px[weight]) --> 200ms[m
   // So collision test should be performed every 200ms, if lag is bigger there should be additional collision checking performed...[m
[36m@@ -26,21 +40,19 @@[m [mPlayer.prototype.changeDirSrv = function(newdir, tm){[m
   var tm_to;[m
   if(lag>lag_tolerance){[m
 [m
[31m-    // not good idea[m
[31m-    // if(lag>lag_tolerance*2){[m
[31m-    //   tm_to = tm+lag_tolerance;[m
[31m-    // }[m
 [m
     tm_to = tm_now-lag_tolerance;[m
[32m+[m[32m    this.unprocessed_lag_vector += parseInt(tm_to-input.tm);[m
 [m
[31m-    if(tm_to >= this.game_state.tm_quit_consideration && tm<=this.game_state.tm_quit_consideration ){[m
[31m-      tm_to = this.game_state.tm_quit_consideration;[m
[31m-    }[m
[32m+[m[32m    // if(tm_to > this.game_state.tm_quit_consideration && tm<this.game_state.tm_quit_consideration ){[m
[32m+[m[32m    //   tm_to = this.game_state.tm_quit_consideration;[m
[32m+[m[32m    // }[m
 [m
     console.log("");[m
     console.log("LAG REDUCTION");[m
     console.log("input tm(from): " + input.tm );[m
     console.log("new tm(to): " + tm_to);[m
[32m+[m[32m    console.log("id: " + this.id_cnt_srv);[m
     console.log("reduced by: " + parseInt(tm_to-input.tm));[m
     console.log("");[m
 [m
[36m@@ -61,18 +73,20 @@[m [mPlayer.prototype.changeDirSrv = function(newdir, tm){[m
       this.reduction_timeout = null;[m
       this.socket.emit("reduction", this.reduction_queue ); // from  -  to[m
       this.reduction_queue = [];[m
[31m-    }, 2000);[m
[32m+[m[32m    }, 1000);[m
 [m
     input.tm = tm_to; // new time,[m
     tm = tm_to;[m
 [m
   }[m
[31m-[m
[31m-[m
[31m-  // new input with tm earlier than collision tm[m
[31m-[m
[31m-  if(this.name == "user6"){[m
[31m-    console.log("tm_input: " + tm);[m
[32m+[m[32m  else{[m
[32m+[m[32m    if(this.name == "user6"){[m
[32m+[m[32m      console.log("");[m
[32m+[m[32m      console.log("LAG not reduced");[m
[32m+[m[32m      console.log("id: " + this.id_cnt_srv);[m
[32m+[m[32m      console.log("tm: " + tm);[m
[32m+[m[32m      console.log("");[m
[32m+[m[32m    }[m
   }[m
 [m
   // reset collision if input was triggered earlier[m
[36m@@ -121,28 +135,9 @@[m [mPlayer.prototype.changeDirSrv = function(newdir, tm){[m
     clearTimeout(this.collision_timeout);[m
   }[m
 [m
[31m-  if(this.game_state.player_consideration == false && tm<this.game_state.tm_quit_consideration){[m
[31m-[m
[31m-    //apply first path before qc[m
[31m-[m
[31m-[m
[31m-    this.clearFurtherPaths(this.game_state.tm_quit_consideration, true);[m
[31m-    this.applyStartPoitOfCurpathState(this.path_before_qc);[m
[31m-[m
[31m-    if(this.name=="user6"){[m
[31m-      console.log("input triggered before qc arrived after qc");[m
[31m-      console.log("tm of curpath: " + this.curpath.tm);[m
[31m-      console.log("tm of input:" + input.tm);[m
[31m-      console.log("tm of qc: " + this.game_state.tm_quit_consideration );[m
[31m-    }[m
[31m-[m
[31m-    input.discard_save = true;[m
[31m-[m
[31m-    this.inputs.push(input);[m
[31m-    this.inputs.push({[m
[31m-      type: "quit_consideration"[m
[31m-    })[m
[32m+[m[32m  if(tm<this.game_state.tm_quit_consideration && this.game_state.player_consideration == false ){[m
 [m
[32m+[m[32m    this.injectPathBeforeQc(input.tm, input.dir);[m
     return;[m
 [m
   }[m
[36m@@ -151,14 +146,6 @@[m [mPlayer.prototype.changeDirSrv = function(newdir, tm){[m
 [m
   return;[m
 [m
[31m-  //TODO: handle breakouts. path_id is legacy[m
[31m-  // if(path_id==-1){ // changed from breakdown[m
[31m-  //   return done_path;[m
[31m-  // }[m
[31m-  //else{[m
[31m-  //  this.io.to(this.socket.currentRoom).emit("dirchanged", this.socket.playername, newdir, done_path, this.renderBuff  );[m
[31m-  //}[m
[31m-[m
 }[m
 [m
 Player.prototype.timeout_breakdown = undefined;[m
