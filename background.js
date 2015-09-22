var host='www.messenger.com';
var pathNew='';
var pathZero='';
var showFN=false;
var counter=0;
var newNotif=false;
var protocol='https'
var alwaysNew=true;
var showZero=false;
var deskNoti=null;
var showNoti=false;
var timeNoti=10000;
var timerVar=null;
var timerDelay=60000;
var playSound=false;
var audio=new Audio('ding.ogg');
window.onload=init;
var BADGE_NEW={color:[0,204,51,255]};
var BADGE_ACTIVE={color:[204,0,51,255]};
var BADGE_LOADING={color:[204,204,51,255]};
var BADGE_INACTIVE={color:[153,153,153,255]};
function loadData(){
	var xhr=new XMLHttpRequest();
	xhr.open('GET','http://www.facebook.com/home.php',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			chrome.browserAction.setBadgeBackgroundColor(BADGE_INACTIVE);
			var xmlDoc=xhr.responseText;
			var fUser='';
			var loc=xmlDoc.indexOf('_2dpb');
			if(loc>0){
				var myString=xmlDoc.substr(loc,120);
				fUser=myString.substring(myString.indexOf('>')+1,myString.indexOf('<'));
			}
			else if(xmlDoc.indexOf('headerTinymanName')>0){
				loc=xmlDoc.indexOf('headerTinymanName');
				var myString=xmlDoc.substr(loc,120);
				fUser=myString.substring(myString.indexOf('>')+1,myString.indexOf('<'));
			}
			if(fUser){
				var lastCounter=counter;
				var noti=0;
				// Message Value
				loc=xmlDoc.indexOf('messagesCountValue');
				if(loc>0){
					var myString=xmlDoc.substr(loc,80);
					counter=parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')),10);
				}
				// Notification Value
				if(showFN){
					loc=xmlDoc.indexOf('notificationsCountValue');
					if(loc>0){
						var myString=xmlDoc.substr(loc,80);
						noti=parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')),10);
					}
				}
				var badgeTitle=fUser+' - Facebook Messenger';
				if(counter>0) badgeTitle+='\n> '+counter+' Messages';
				if(showFN&&noti>0) badgeTitle+='\n> '+noti+' Notifications';

				chrome.browserAction.setIcon({path:'icon.png'});
				chrome.browserAction.setTitle({title:badgeTitle});
				if(!showZero&&counter+noti==0)chrome.browserAction.setBadgeText({text:''});
				else if(showFN&&noti>0) chrome.browserAction.setBadgeText({text:(counter||'')+'+'+noti});
				else chrome.browserAction.setBadgeText({text:counter+''});
				if(counter>lastCounter){
					newNotif=true;
					if(playSound)audio.play();
					if(showNoti){
						if(deskNoti)deskNoti.cancel();
						deskNoti=webkitNotifications.createNotification('icon48.png','Facebook Messenger Notifications','You have '+counter+' new messages');
						deskNoti.onclick=function(){openPage();this.cancel()};
						deskNoti.show();
						if(timeNoti){window.setTimeout(function(){deskNoti.cancel();},timeNoti);}
					}
				}
				if(newNotif)chrome.browserAction.setBadgeBackgroundColor(BADGE_NEW);
				else if(counter+noti>0)chrome.browserAction.setBadgeBackgroundColor(BADGE_ACTIVE);
			}
			else{
				chrome.browserAction.setIcon({path:'icon-.png'});
				chrome.browserAction.setTitle({title:'--Disconnected--'});
				chrome.browserAction.setBadgeText({text:'?'});
				return;
			}
		}
		else return;
	}
	xhr.send(null);
	window.clearTimeout(timerVar);
	timerVar=window.setTimeout(loadData,timerDelay);
}
function init(){
	pathNew=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:pathNew;
	pathZero=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:pathZero;
	showFN=(localStorage.showFN)?(localStorage.showFN=='yes'):false;
	protocol=(localStorage.useHttps=='yes')?'https':'http';
	alwaysNew=(localStorage.alwaysNew)?(localStorage.alwaysNew=='yes'):true;
	showZero=(localStorage.showZero)?(localStorage.showZero=='yes'):false;
	playSound=(localStorage.playSound)?(localStorage.playSound=='yes'):false;
	showNoti=(localStorage.showNoti)?(localStorage.showNoti=='yes'):false;
	timeNoti=parseInt(localStorage.timeNoti||'20000',10);
	timerDelay=parseInt(localStorage.refreshInterval||'60000',10);

	chrome.browserAction.setIcon({path:'icon-.png'});
	chrome.browserAction.setBadgeText({text:'...'});
	chrome.browserAction.setBadgeBackgroundColor(BADGE_LOADING);
	loadData();
}
function tabCallback(tab){
	chrome.tabs.onRemoved.addListener(function(tabId){if(tabId==tab.id)loadData();});
	chrome.windows.update(tab.windowId,{focused:true});
}
function openUrl(uri){
	chrome.windows.getAll({populate:true},function(windows){
		if(windows.length<1){
			chrome.windows.create({url:uri,focused:true});
			return;
		}
		else if(!alwaysNew){
			for(var i=0;i<windows.length;i++){
				var tabs=windows[i].tabs;
				for(var j=0;j<tabs.length;j++){
					if(tabs[j].url.indexOf(uri)!=-1){
						chrome.tabs.update(tabs[j].id,{selected:true},tabCallback);
						return;
					}
				}
			}
		}
		chrome.tabs.getSelected(null,function(tab){
			if(tab.url=='chrome://newtab/')
				chrome.tabs.update(tab.id,{url:uri},tabCallback);
			else
				chrome.tabs.create({url:uri},tabCallback);
		});
	});
}
function openPage(){
	if(counter>0)
		openUrl(protocol+'://'+host+'/'+pathNew);
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}
chrome.browserAction.onClicked.addListener(function(tab){
	openPage();
});