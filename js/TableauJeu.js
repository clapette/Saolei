var tCase = 30;
var gameTab;
var fini;
var premierClic;
var duree;
var mute = false;
var compteurDuree;

var positionBombes

function jouer() {
	effacerTerrain();
	initialiserInfos();
	creerTableau();
	placerBombes();
	ecouteursJeu();
}

function effacerTerrain() {
	$("#jeuPlateau").html("");
}

function initialiserInfos() {
	duree = 0;
	$("#tempsEcoule").html(0);
	arreterCompteur();

	fini = false;
	premierClic = true;
	$("#affNbPts").html(0);
	$("#affNbDrap").html(getNBMine);
	$("#messageFin").html(" ");
	jouerSon("start");
}

function recommencerJeu() {
	$(".caseJeu").attr("src", "../images/cases/vide.png");
	initialiserInfos();
}

function creerTableau() {
	var nbMine = getNBMine();
	var xtab = getXTab(), ytab = getYTab();

	for(i=0; i<xtab*ytab; i++) {
			$("#jeuPlateau").append("<img id=\""+idCaseJeu(i)+"\" class=\"caseJeu\" src=\"../images/cases/vide.png\" width=\""+tCase+"px\" height=\""+tCase+"px\"></div>");
	}
	rechargerTailleCases();

	gameTab = new Array(xtab*ytab);
	for(i=0; i<xtab*ytab; i++) {
		gameTab[i] = new Case(i);
	}
}

function placerBombes() {
	recuperePostionBombesAlea();
	for(i=0; i<positionBombes.length; i++) {
		gameTab[positionBombes[i]].setType(type_bombe);
	}
}

function recuperePostionBombesAlea() {
	positionBombes = new Array();
	var nbAPoser = getNBMine();
	for(i=0; i<nbAPoser; i++) {
		var pos;
		do {
			pos = posAlea();
		} while(estDejaPresent(pos));
		positionBombes.push(pos);
	}
}

function estDejaPresent(pos) {
	for(i=0; i<positionBombes.length; i++)
		if(pos == (positionBombes[i])) return true;
}

function posAlea() {
	return Math.floor( (Math.random()*(getXTab()*getYTab()) ));
}

function idCaseJeu(x) {
	return "case"+x;
}

function agrandireCases() {
	if(tCase < 100) tCase += 1;
	rechargerTailleCases();
}

function reduireCases() {
	if(tCase > 21) tCase -=1;
	rechargerTailleCases();
}

function rechargerTailleCases() {
	$("#jeuPlateau").css("width", (tCase*getXTab())+"px")
	$(".caseJeu").attr("width", tCase);
	$(".caseJeu").attr("height", tCase);
}

function getXTab() {
	var tabSize = getDimmenssionTableau();
	return parseInt(tabSize[0]);
}

function getYTab() {
	var tabSize = getDimmenssionTableau();
	return parseInt(tabSize[1]);
}

function clicCase(id) {
	if(fini) return;
	if(premierClic) {
		premierClic = false;
		demarerCompteur();
	}
	switch(gameTab[getNumCase(id)].getType().getNom()) {
		case 'vide':
			jouerSon("clic");
			clicVide(getNumCase(id));
		break;
		case 'bombe':
			clicBombe(id);
		break;
	}
	if(verifierVictoire()) {
		animVictoire();
	}
}

function clicBombe(id) {
	for(i=0; i<gameTab.length; i++) {
		if(gameTab[i].getType().getNom() == "bombe") $("#case"+i).attr("src", "../images/cases/bombe.png");
	}
	animPerdu();
}

function animPerdu() {
	$("#messageFin").html("Perdu !");
	arreterCompteur();
	fini = true;
	jouerSon("boum");
}

function animVictoire() {
	$("#messageFin").html("Bravo vous avez gagne !");
	arreterCompteur();
	fini = true;
	jouerSon("win");
}

function clicVide(numCase) {
	if(numCase==null) return;
	if(!verifierNumCase(numCase)) return;
	if( $("#case"+numCase).attr("src") !=  "../images/cases/vide.png") return;

	var nbB = compterBombesAutour(numCase);
	if(nbB == 0) {
		changerImage(numCase, "sansBombe.png");	
		
		clicVide(caseBas(numCase));
		clicVide(caseHaut(numCase));
		clicVide(caseDroite(numCase));
		clicVide(caseGauche(numCase));
		clicVide(caseHD(numCase));
		clicVide(caseHG(numCase));
		clicVide(caseBD(numCase));
		clicVide(caseBG(numCase));
		
	} else changerImage(numCase, nbB+"bombe.png");

	gagner1Point();
}

function changerImage(numCase, image) {
	$("#case"+numCase).attr("src", "../images/cases/"+image);
}

function gagner1Point() {
	$("#affNbPts").html(parseInt($("#affNbPts").html())+1);
}

function caseDroite(numCase) {
	if((numCase+1)%getXTab() != 0) 
		return (numCase+1);
	return null;
}

function caseGauche(numCase) {
	if((numCase)%getXTab() != 0) 
		return (numCase-1);
	return null;
}

function caseBas(numCase) {
	if(numCase < getXTab()*getYTab()-getXTab()) 
		return numCase+getXTab();
	return null;
}

function caseHaut(numCase) {
	if(numCase-getXTab() >= 0) 
		return numCase-getXTab();
	return null;
}

function caseHD(numCase) {
	if(caseHaut(numCase) != null && caseDroite(numCase) != null)
		return numCase-getXTab()+1;
	return null;
}

function caseHG(numCase) {
	if(caseHaut(numCase) != null && caseGauche(numCase) != null)
		return numCase-getXTab()-1;
	return null;
}

function caseBD(numCase) {
	if(caseBas(numCase) != null && caseDroite(numCase) != null)
		return numCase+getXTab()+1;
	return null;
}

function caseBG(numCase) {
	if(caseBas(numCase) != null && caseGauche(numCase) != null)
		return numCase+getXTab()-1;
	return null;
}

function verifierNumCase(numCase) {
	if(numCase == null) return false;
	return(numCase >= 0 && numCase < getXTab()*getYTab());
}

function compterBombesAutour(numCase) {
	var nbBombes = 0;

	isCaseBomb(caseHaut(numCase)) 	? nbBombes++ : nbBombes;
	isCaseBomb(caseHD(numCase)) 	? nbBombes++ : nbBombes;
	isCaseBomb(caseDroite(numCase))	? nbBombes++ : nbBombes;
	isCaseBomb(caseBD(numCase))		? nbBombes++ : nbBombes;
	isCaseBomb(caseBas(numCase)) 	? nbBombes++ : nbBombes;
	isCaseBomb(caseBG(numCase))		? nbBombes++ : nbBombes;
	isCaseBomb(caseGauche(numCase))	? nbBombes++ : nbBombes;
	isCaseBomb(caseHG(numCase))		? nbBombes++ : nbBombes;

	return nbBombes;
}

function compterCasesAutour(numCase) {
	var nbCase = 0;
	caseHaut(numCase) 	!= null ? nbCase++ : nbCase;
	caseHD(numCase) 	!= null ? nbCase++ : nbCase;
	caseDroite(numCase)	!= null ? nbCase++ : nbCase;
	caseBD(numCase)		!= null ? nbCase++ : nbCase;
	caseBas(numCase) 	!= null ? nbCase++ : nbCase;
	caseBG(numCase)		!= null ? nbCase++ : nbCase;
	caseGauche(numCase)	!= null ? nbCase++ : nbCase;
	caseHG(numCase)		!= null ? nbCase++ : nbCase;
	return nbCase;
}

function getNomTypeCase(numCase) {
	if(verifierNumCase(numCase))
		return gameTab[numCase].getType().getNom();
	else
		return null;
}

function isCaseBomb(numCase) {
	if(verifierNumCase(numCase))
		return getNomTypeCase(numCase) == 'bombe';
	else
		return null;
}

function clicDroitCase(id) {
	if(fini) return;

	var urlImg = $("#"+id).attr("src");
	if(urlImg.substr(urlImg.length-10, urlImg.length) == "danger.png") {
		changerImage(getNumCase(id), "vide.png");
		$("#affNbDrap").html(parseInt($("#affNbDrap").html())+1);
		jouerSon("drapeauOff");
	} else if(parseInt($("#affNbDrap").html()) == 0) {
		alert("Vous n'avez plus de drapeaux à poser");
	} else if(urlImg.substr(urlImg.length-8, urlImg.length) == "vide.png") {
		changerImage(getNumCase(id), "danger.png");
		$("#affNbDrap").html(parseInt($("#affNbDrap").html())-1);
		jouerSon("drapeauOn");
	}

	if(verifierVictoire()) {
		animVictoire();
	}
}

function timer() {
	$("#tempsEcoule").html(duree++);
}

function verifierVictoire() {
	// Si on a pas posé tous les drapeaux on a pas gagné
	if(nombreDrapeauRestant() != 0) return false;

	var verif = $(".caseJeu");
	for(i=0; i<verif.length; i++) {
		var tailleTxt = verif[i].src.length;
		var urlIco = verif[i].src.substr(tailleTxt-8, tailleTxt);
		if(urlIco == "vide.png") return false;
	}
	return true;
}

function nombreDrapeauRestant() {
	var r = $("#affNbDrap").html();
	return parseInt(r);
}

function reinitialiserJeu() {
	jouer();
}

function demarerCompteur() {
	compteurDuree = setInterval(timer ,1000);
}

function arreterCompteur() {
	clearInterval(compteurDuree);
}

function jouerSon(nom) {
	if(!mute) {
		switch(nom) {
			case "boum": 
				son_boum.play();
			break;
			case "clic": 
				son_clic.play();
			break;
			case "start": 
				son_start.play();
			break;
			case "win": 
				son_win.play();
			break;
			case "drapeauOn": 
				son_drapeauOn.play();
			break;
			case "drapeauOff": 
				son_drapeauOff.play();
			break;
		}
	}
}

function verifierMenuOption() {
	var optXMap = $("#xMap").val();
	var optYMap = $("#yMap").val();
	var optNbMines = $("#nbMines").val();

	// Si coordonnée négative
	if(optXMap <= 0) return false;
	if(optYMap <= 0) return false;

	// Si coordonnée trop grande
	if(optXMap > 50) return false;
	if(optYMap > 50) return false;

	// Si nb négatif de mines
	if(optNbMines < 0) return false;

	// Si plus de mines que de cases
	if(optNbMines > optXMap*optYMap) return false;

	return true;
}