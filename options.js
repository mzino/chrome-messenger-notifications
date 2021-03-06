function $(id){return document.getElementById(id);}
function enableSave(){$('saveButton').disabled=false;}
function disableSave(){$('saveButton').disabled=true;}
window.onload=function(){
	$('useFB').addEventListener('click',enableSave);
	$('useFBzero').addEventListener('click',enableSave);
	$('showFN').addEventListener('click',enableSave);
	$('useHttps').addEventListener('click',enableSave);
	$('alwaysNew').addEventListener('click',enableSave);
	$('showZero').addEventListener('click',enableSave);
	$('playSound').addEventListener('click',enableSave);
	$('showNoti').addEventListener('click',enableSave);
	$('timeNoti').addEventListener('click',enableSave);
	$('refreshInterval').addEventListener('click',enableSave);
	$('saveButton').addEventListener('click',save);
	$('restoreButton').addEventListener('click',clear);
	$('useBg').addEventListener('click',setUseBg);
	init();
}
function init(){
	$('useFB').checked=(localStorage.useFB)?(localStorage.useFB == 'yes'):false;
	$('useFBzero').checked=(localStorage.useFBzero)?(localStorage.useFBzero == 'yes'):false;
	$('showFN').checked=(localStorage.showFN)?(localStorage.showFN == 'yes'):false;
	$('useHttps').checked=(localStorage.useHttps)?(localStorage.useHttps == 'yes'):true;
	$('alwaysNew').checked=(localStorage.alwaysNew)?(localStorage.alwaysNew == 'yes'):true;
	$('showZero').checked=(localStorage.showZero)?(localStorage.showZero == 'yes'):false;
	$('playSound').checked=(localStorage.playSound)?(localStorage.playSound == 'yes'):false;
	$('showNoti').checked=(localStorage.showNoti)?(localStorage.showNoti == 'yes'):false;
	$('timeNoti').value=(parseInt(localStorage.timeNoti)>=0)?parseInt(localStorage.timeNoti)/1000+'':'20';
	$('refreshInterval').value=(parseInt(localStorage.refreshInterval))?parseInt(localStorage.refreshInterval)/60000+'':'1';
	disableSave();
	chrome.permissions.contains({permissions:['background']},function(result){
		$('useBg').checked=result;
	});
}
function save(){
	localStorage.useFB=$('useFB').checked?'yes':'no';
	localStorage.useFBzero=$('useFBzero').checked?'yes':'no';
	localStorage.showFN=$('showFN').checked?'yes':'no';
	localStorage.useHttps=$('useHttps').checked?'yes':'no';
	localStorage.alwaysNew=$('alwaysNew').checked?'yes':'no';
	localStorage.showZero=$('showZero').checked?'yes':'no';
	localStorage.playSound=$('playSound').checked?'yes':'no';
	localStorage.showNoti=$('showNoti').checked?'yes':'no';
	
	localStorage.timeNoti=(!isNaN($('timeNoti').value)&&parseInt($('timeNoti').value)>=0)?parseInt($('timeNoti').value*1000):20000;
	localStorage.refreshInterval=(!isNaN($('refreshInterval').value)&&parseInt($('refreshInterval').value)>0)?parseInt($('refreshInterval').value*60000):300000;

	init();
	chrome.extension.getBackgroundPage().init();
}
function clear(){
	if(confirm('Restore all data to default?\nThis can\'t be undone...')){
		localStorage.clear();
		init();
	}
}
function setUseBg(){
	if($('useBg').checked)
		chrome.permissions.request({permissions:['background']});
	else
		chrome.permissions.remove({permissions:['background']});
}