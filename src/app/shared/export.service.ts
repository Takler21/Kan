import { Injectable, EventEmitter, Output, Input } from "@angular/core";
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable, } from "angularfire2";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable, Subject, ReplaySubject, AsyncSubject } from "rxjs";
import { Project } from "../models/project-info";
import { CardList } from "../models/cardlist-info";
import { SubCardList } from "../models/subcardlist-info";
import { Card } from "../models/card-info";
import { Task } from "../models/task-info";
import { DataService } from "app/shared/data.service";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable()
export class ExportService {

    cardlistExp: CardList[];
    cardsExp;
    subcardlistsExp;
    @Input() projectExp: Project;
    taskExp;
    cardlistStr: string = "";
    cardsStr;
    subCardListStr:string;
    taskStr: string;
    resJsonResponse;

    constructor(private af: AngularFire, private dataService: DataService,
        private sanitizer: DomSanitizer) {
    }
    //Formamos los conjuntos que formaran el Json a partir del tipo de elemnto que sean.
    getJsonExport() {
        this.dataService.getCardListsByProject(this.projectExp.$key).subscribe(cList => {
            this.cardlistExp = cList;
            let i = 0;
            this.cardlistStr = "";
            cList.forEach(cL => {
                this.cardlistStr = this.cardlistStr.concat(`"` + cL.$key + `":{
                                                "color":"` + cL.color + `", 
                                                "name":"`+ cL.name + `", 
                                                "projectId": "`+ cL.projectId + `", 
                                                "order": `+ cL.order + `, 
                                                "created_at": "`+ cL.created_at + `"}`).concat(", " + "\n");
            });
            this.cardsExp = [];
            this.cardsStr = "";
            this.subcardlistsExp = [];
            this.subCardListStr = "";
            this.taskExp = [];
            this.taskStr = "";
            cList.forEach(cardList => {
                this.dataService.getSubCardListsByListId(cardList.$key)
                    .subscribe(subList => {
                        if (subList.length > 0) {
                            subList.forEach(sub => {
                                if (this.subcardlistsExp.indexOf(sub) == -1) {
                                    this.subCardListStr = this.subCardListStr.concat(`  "` + sub.$key + `":{
                                        "cardlistId":"` + sub.cardlistId + `", 
                                        "name":"`+ sub.name + `", 
                                        "order": `+ sub.order + `, 
                                        "created_at": "`+ sub.created_at + `"}, `.concat("\n"));
                                    this.subcardlistsExp.push(sub);
                                }
                                this.dataService.getCardsByListId(sub.$key)
                                    .subscribe(cardSub => {
                                        cardSub.forEach(t => {
                                            if (this.cardsExp.indexOf(t) == -1) {
                                                this.cardsStr = this.cardsStr.concat(`"` + t.$key + `":{
                                "description":"` + t.description + `", 
                                "cardListId":"` + t.cardListId + `", 
                                "name":"`+ t.name + `", 
                                "isExpanded":` + t.isExpanded + `,
                                "order": `+ t.order + `, 
                                "created_at": "`+ t.created_at + `"}, `.concat("\n"));
                                                this.cardsExp.push(t);
                                            }
                                            this.dataService.getTasksByCardId(t.$key)
                                                .subscribe(data => {
                                                    data.forEach(da => {
                                                        if (this.taskExp.indexOf(da.$key) == -1) {
                                                            this.taskStr = this.taskStr.concat(`"` + da.$key + `":{
                                "description":"` + da.description + `", 
                                "isCompleted":`+ da.isCompleted + `, 
                                "cardId": "`+ da.cardId + `", 
                                "order": `+ da.order + `, 
                                "created_at": "`+ da.created_at + `"}, `.concat("\n"));
                                                            this.taskExp.push(da.$key)
                                                        }
                                                    })

                                                });
                                        })
                                    })
                            })
                            this.subCardListStr = this.subCardListStr.slice(0, this.subCardListStr.lastIndexOf(",") - 1).concat("}");
                        }
                        else {
                            this.dataService.getCardsByListId(cardList.$key).subscribe(cards => {

                                cards.forEach(c => {
                                    if (this.cardsExp.indexOf(c) == -1) {
                                        let nombre = c.name;
                                        if (c.name.indexOf('"') > -1) {
                                            nombre = this.replaceAll(nombre, '\\"', '"')
                                        }
                                        this.cardsStr = this.cardsStr.concat(`"` + c.$key + `":{
                    "description":"` + c.description + `", 
                    "cardListId":"` + c.cardListId + `", 
                    "name":"`+ nombre + `", 
                    "isExpanded":` + c.isExpanded + `,
                    "order": `+ c.order + `, 
                    "created_at": "`+ c.created_at + `"}, `.concat("\n"));
                                        this.cardsExp.push(c);
                                    }
                                    this.dataService.getTasksByCardId(c.$key).subscribe(data => {
                                        data.forEach(da => {
                                            if (this.taskExp.indexOf(da.$key) == -1) {
                                                this.taskExp.push(da.$key)
                                                this.taskStr = this.taskStr.concat(`"` + da.$key + `":{
                                    "description":"` + da.description + `", 
                                    "isCompleted":`+ da.isCompleted + `, 
                                    "cardId": "`+ da.cardId + `", 
                                    "order": `+ da.order + `, 
                                    "created_at": "`+ da.created_at + `"}, `.concat("\n"));
                                                
                                            }
                                        })
                                    });
                                });
                            });
                        }
                    });
            });

        });
    }
    //Da la forma al string que pasaremos para generar el JSON.
    setJsonExport() {
        this.getJsonExport();
        let projStr = `"` + this.projectExp.$key + `":{
                        "created_at":"` + this.projectExp.created_at + `", 
                        "name":"` + this.projectExp.name + `"
                        }`;

        this.cardlistStr = this.cardlistStr.slice(0, this.cardlistStr.lastIndexOf(",") - 1);
        if (this.cardlistExp.length > 0)
            this.cardlistStr = this.cardlistStr.concat("}")
        this.cardsStr = this.cardsStr.slice(0, this.cardsStr.lastIndexOf(",") - 1);
        if (this.cardsExp.length > 0) {
            this.cardsStr = this.cardsStr.concat("}")
        }
        this.taskStr = this.taskStr.slice(0, this.taskStr.lastIndexOf(",") - 1);
        if (this.taskExp.length > 0) {
            this.taskStr=this.taskStr.concat("}")
        }
        this.resJsonResponse = `{
            "cardlist": {
                `+ this.cardlistStr + `
            },
            "cards": {
                `+ this.cardsStr + `
            },
            "projects": {
                `+ projStr + `
            },
            "subcardlist": {
                `+ this.subCardListStr + `
            },
            "tasks": {
                `+ this.taskStr + `
    }
}`
    }
    //Metodo para que las comillas dentro de un string se importen correctamente como parte del string.
    replaceAll(cadena: string, replacement: string, searched): string {
        let i = 0
        let replaced = "";
        let indexes = [];
        let segments = [];
        while (cadena.indexOf(searched, i) > -1 && (cadena.length > i && i > -1)) {
            segments.push(cadena.substring(i, cadena.indexOf(searched, i)))
            i = cadena.indexOf(searched, i) + 1;
        }
        segments.forEach(seg => {
            replaced = replaced.concat(seg).concat(replacement);
        })
        if (cadena.lastIndexOf(searched) < cadena.length - 1)
            replaced = replaced.substr(0, replaced.length - replacement.length)
        return replaced;
    }
}