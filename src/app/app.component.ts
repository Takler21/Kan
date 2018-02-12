import { Component, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { DataService } from "app/shared/data.service";
import { ExportService } from "app/shared/export.service";

import { Observable } from "rxjs";

import { Project } from "app/models/project-info";
import { CardList } from "app/models/cardlist-info";
import { Card } from "app/models/card-info";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    @ViewChild('fileImportInput')
    fileImportInput: any;

    title = 'The Kanban Board';
    //
    projects: Project[];
    //
    cardlists: CardList[];
    //
    projectSelected: Project;
    projectname;
    cardlistname: string;
    cardlistcolor: string;
    cardlistorder: number;
    toShowAddProject: boolean;
    toShowAddCardList: boolean;
    downloadJsonHref;
    importado;
    css_color_names = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];


    constructor(private dataService: DataService,
        private sanitizer: DomSanitizer, private exportService: ExportService) {
    }

    ngOnInit() {
        this.dataService.getProjects()
            .subscribe(data => {
                this.projects = data;
                //Estoy filtrando segun el projecto inicial.
                this.projectSelected = this.projects[0];
                this.exportService.projectExp = this.projectSelected;
                //console.log(firstProject);
                // this.addAddCardList(
                //     'Done', 
                //     firstProject.$key,
                //     'green'
                // );
                if (this.projects.length > 0) {
                    this.filterCardLists();
                    this.exportService.getJsonExport();
                }

            });
        this.dataService.getSubCardList();
        this.dataService.getCards();
        this.dataService.getTasks();
    }


    generateDownloadJsonUri() {
        this.resetOrder();
        this.exportService.setJsonExport();
        var theJSON = this.exportService.resJsonResponse;
        var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
        this.downloadJsonHref = uri;
    }

    fileChangeListener($event) {
        let reader = new FileReader();

        if ($event.target.files && $event.target.files.length > 0) {
            var file = $event.target.files[0];

            //Asi conseguimos el JSON aunque sea en string.
            reader.readAsText(file);

            //A veces no actualiza correctamente el navegador,
            //por lo que usaremos estas variables para gestionar eso.
            let projlength = this.projects.length;
            let selc = this.projectSelected;

            reader.onload = () => {
                this.importado = reader.result;
                this.importado = JSON.parse(this.importado);
                Object.keys(this.importado.projects).forEach(project => {
                    this.dataService.importProject(project, {
                        "created_at": this.importado.projects[project].created_at,
                        "name": this.importado.projects[project].name
                    })
                });

                Object.keys(this.importado.cardlist).forEach(caList => {
                    if (this.dataService.getProjectById(this.importado.cardlist[caList].projectId)) {
                        this.dataService.importCardlist(caList, {
                            "color": this.importado.cardlist[caList].color,
                            "name": this.importado.cardlist[caList].name,
                            "projectId": this.importado.cardlist[caList].projectId,
                            "order": this.importado.cardlist[caList].order,
                            "created_at": this.importado.cardlist[caList].created_at
                        });
                    }
                });

                Object.keys(this.importado.subcardlist).forEach(sub => {
                    if (this.dataService.getCardListsById(this.importado.subcardlist[sub].cardlistId)) {
                        this.dataService.importSubcardlist(sub, {
                            "cardlistId": this.importado.subcardlist[sub].cardlistId,
                            "name": this.importado.subcardlist[sub].name,
                            "order": this.importado.subcardlist[sub].order,
                            "created_at": this.importado.subcardlist[sub].created_at
                        });
                    }
                });

                Object.keys(this.importado.cards).forEach(ca => {
                    if (this.dataService.getCardListsById(this.importado.cards[ca].cardListId) || this.dataService.getSubCardListsById(this.importado.cards[ca].cardListId)) {
                        this.dataService.importCards(ca, {
                            "description": this.importado.cards[ca].description,
                            "cardListId": this.importado.cards[ca].cardListId,
                            "name": this.importado.cards[ca].name,
                            "isExpanded": this.importado.cards[ca].isExpanded,
                            "order": this.importado.cards[ca].order,
                            "created_at": this.importado.cards[ca].created_at
                        });
                    }
                });

                Object.keys(this.importado.tasks).forEach(ta => {
                    if (this.dataService.getCardsById(this.importado.tasks[ta].cardId)) {
                        this.dataService.importTasks(ta, {
                            "description": this.importado.tasks[ta].description,
                            "isCompleted": this.importado.tasks[ta].isCompleted,
                            "cardId": this.importado.tasks[ta].cardId,
                            "order": this.importado.tasks[ta].order,
                            "created_at": this.importado.tasks[ta].created_at
                        });
                    }
                });
                if (projlength == this.projects.length) {
                    this.dataService.getProjects().subscribe(data => {
                        this.projects = data;

                    });
                }
                this.projectSelected = selc;
            };
        }
    }

    addProject(name: string) {
        let created_at = new Date().toString();
        let newProject: Project = new Project();
        newProject.name = name;
        newProject.created_at = created_at;
        this.dataService.addProject(newProject);
    }

    deleteProject() {
        this.resetOrder();
        let mono;
        this.exportService.setJsonExport();
        mono = JSON.parse(this.exportService.resJsonResponse)
        Object.keys(mono.tasks).forEach(task => {
            this.dataService.deleteTask(task);
        });
        Object.keys(mono.cards).forEach(ca => {
            this.dataService.deleteCard(ca);
        });
        Object.keys(mono.subcardlist).forEach(sub => {
            this.dataService.deleteSubCard(sub);
        });
        Object.keys(mono.cardlist).forEach(calist => {
            this.dataService.deleteCardlist(calist);
        });
        this.dataService.deleteProject(this.projectSelected.$key);
    }

    resetOrder() {
        let ord = 0;
        this.cardlists.forEach(c => {
            if (c.order != ord)
                this.dataService.updateCardList(c.$key, { order: ord })
            ord++;
        })
    }

    addCardList(
        name: string,
        projectId: string,
        color: string,
        order: number) {
        let created_at = new Date().toString();
        let newCardList: CardList = new CardList();
        newCardList.name = name;
        newCardList.projectId = projectId;
        newCardList.color = color;
        newCardList.order = order;
        newCardList.created_at = created_at;
        this.dataService.addCardList(newCardList);
    }

    saveAddProject() {
        this.addProject(this.projectname);
        this.toShowAddProject = false;
    }

    saveAddCardList() {
        this.resetOrder();
        this.cardlists.forEach(cardlist => {
            if (cardlist.order >= this.cardlistorder)
                this.dataService.updateCardList(cardlist.$key, { order: cardlist.order + 1 })
        })
        this.addCardList(this.cardlistname, this.projectSelected.$key,
            this.cardlistcolor, this.cardlistorder);
        this.toShowAddCardList = false;
    }
    //Filtra las tareas por los cardlist segun el projecto al que pertenezcan.
    filterCardLists() {
        this.dataService.getCardLists()
            .subscribe(c => {
                this.cardlists = c;
                this.cardlists = this.cardlists.filter(cardlist => cardlist.projectId == this.projectSelected.$key);
            })
            ;
    }

    styles() {
        let sty = `padding-right: 15px; padding-left: 15px; width:${100 / this.cardlists.length}%; float: left`;
        return this.sanitizer.bypassSecurityTrustStyle(sty);
    }
    //Mostrar modal project
    showAddProject() {
        this.projectname = '';
        this.toShowAddProject = true;
    }
    //Ocultar modal project
    cancelAddProject() {
        this.toShowAddProject = false;
    }
    //Mostrar modal cardlist
    showAddCardList() {
        this.cardlistname = '';
        this.cardlistcolor = '';
        this.cardlistorder = this.cardlists.length;
        this.toShowAddCardList = true;
    }
    //Ocultar modal cardlist
    cancelAddCardList() {
        this.toShowAddCardList = false;
    }

    onChange(val) {
        this.projectSelected = val;
        this.exportService.projectExp = val;
        this.filterCardLists();
        this.exportService.setJsonExport();
    }

}
