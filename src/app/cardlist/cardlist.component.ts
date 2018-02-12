import { Component, OnInit, Input } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { DataService } from "app/shared/data.service";
import { ExportService } from "app/shared/export.service";
import { Observable } from "rxjs";
import { CardList } from "app/models/cardlist-info";
import { SubCardList } from "app/models/subcardlist-info";
import { Card } from "app/models/card-info";
import { Task } from "app/models/task-info";

@Component({
    selector: 'cardlist',
    templateUrl: './cardlist.component.html',
    styleUrls: ['./cardlist.component.css']
})
export class CardListComponent implements OnInit {
    @Input() item: CardList;

    existSub: boolean;
    cardlistEmpty: boolean;
    cards: Card[]
    subcardlists: SubCardList[];
    fatherIdCard: string;
    toShowAddCard: boolean;
    editCard: Card;

    subcardlistname: string;
    toShowAddSubCardList: boolean;

    cardname;
    carddescription;
    allowedDropFrom = [];
    allowedDragTo = false;


    constructor(private dataService: DataService, private exportService: ExportService) {
    }

    ngOnInit() {
        this.dataService.getSubCardListsByListId(this.item.$key)
            .subscribe(s => {
                this.subcardlists = s;
                this.existSub = this.subcardlists.length != 0;
                //En desarrollo.
                if (!this.existSub) {
                    this.dataService.getCardsByListId(this.item.$key)
                        .subscribe(data => {
                            this.cards = data;
                            if (this.cards.length == 0)
                                this.cardlistEmpty = true
                            else
                                this.cardlistEmpty = false;
                            this.exportService.getJsonExport();
                        });
                }
                else {
                    this.loadCardWithSublists();
                }
            });

        //fill allowed drop-from containers

        //Usar item para el id del proyecto, con el que sacar 
        //los card list y filtrar o lo que sea por orden.
        //luego comprobar si el siguiente tiene subcardlist
        this.allowedDropFrom = [];
        this.dataService.getCardLists().subscribe(p => {
            let carp = p.filter(cardlist => cardlist.projectId == (this.item.projectId))
            this.allowedDropFrom = [];
            carp.forEach(p1 => {
                if (p1.order == this.item.order - 1)
                    this.allowedDropFrom.push(p1.$key);
                //Hasta aqui permite el pase de cardlist normales
            });
            //Add subcardlists keys to allowedDropFrom variable.
            this.dataService.getSubCardListsByListId(this.allowedDropFrom[0])
                .subscribe(data => {
                    if (data.length > 0 && this.item.order != 0)
                        data.forEach(sub => {
                            this.allowedDropFrom.push(sub.$key);
                        })
                })
            //Let change card between subcardlist in the same card list
            if (this.subcardlists && this.subcardlists.length > 0) {
                this.subcardlists.forEach(sub => {
                    this.allowedDropFrom.push(sub.$key);
                }
                );
            }
        });
        //fill if it has next containers
        this.dataService.getCardListsByOrder(this.item.order + 1)
            .subscribe(d => {
                if (d.length > 0)
                    this.allowedDragTo = true;
            }
            );
    }

    loadCardWithSublists() {

        //tal vez saldria más rentable si no uso concat
        //y comparo los valores aunque sea con un bucle.
        if (!this.cards || this.existSub)
            this.cards = [];
        this.subcardlists.forEach(sub => {
            if (this.allowedDropFrom.indexOf(sub.$key))
                this.allowedDropFrom.push(sub.$key);
            this.dataService.getCardsByListId(sub.$key)
                .subscribe(data => {
                    let aux = [];
                    this.cards.forEach(c => {
                        aux[c.$key] = c.$key;
                    });
                    data.forEach(d => {
                        if (!aux[d.$key]) {
                            this.cards.push(d);
                        }
                    })
                    this.exportService.getJsonExport()
                });
        })

    }

    showAddCard(id) {
        this.cardname = '';
        this.carddescription = '';
        this.toShowAddCard = true;
        this.fatherIdCard = id;
    }

    cancelAddCard() {
        this.toShowAddCard = false;
    }
    saveAddCard() {
        //console.log('save card');
        this.addCard(
            this.cardname,
            this.carddescription,
            true,
            this.fatherIdCard,
            0);
        if (this.subcardlists) {
            this.loadCardWithSublists();
        }
        this.toShowAddCard = false;
        
    }

    resetOrder(cardli) {
        console.log("es este")
        let ord = 0;
        cardli.forEach(c => {
            console.log(c.order);
            if (c.order != ord)
                console.log(c.order)
                this.dataService.updateCardList(c.$key, { order: ord })
            ord++;
        })
    }

    addCard(
        name: string,
        description: string,
        isExpanded: boolean,
        cardListId: string,
        order: number
    ) {
        let created_at = new Date().toString();
        let newCard: Card = new Card();
        newCard.name = name;
        newCard.description = description;
        newCard.cardListId = cardListId;
        newCard.isExpanded = isExpanded;
        newCard.order = order;
        newCard.created_at = created_at;
        this.dataService.addCard(newCard);
    }

    deleteCard(card) {
        this.dataService.deleteCard(card.$key);
        this.dataService.getTasksByCardId(card.$key).subscribe(data => {
            data.forEach(task => {
                this.dataService.deleteTask(task.$key);
            })
        });
        
        this.loadCardWithSublists();
    }
    //ya tengo cards por lo que otro subcribe seria innecesario, me vale con recorre el arra

    deleteSublist(subc) {

        var cardSub = []
        this.cards.forEach(c => {
            if (c.cardListId == subc.$key) {
                this.dataService.deleteCard(c.$key);
                cardSub.push(c);
            }
        })
        cardSub.forEach(cs => {
            this.dataService.getTasksByCardId(cs.$key).subscribe(data => {
                data.forEach(task => {
                    this.dataService.deleteTask(task.$key);
                })
            });
        });
        this.dataService.deleteSubCard(subc.$key);
        this.loadCardWithSublists();
    }

    deleteCardlist() {
        let tasks;
        this.cards.forEach(c => {
            this.dataService.getTasksByCardId(c.$key)
                .subscribe(t => {
                    t.forEach(task => {
                        this.dataService.deleteTask(task.$key);
                    });
                    this.dataService.deleteCard(c.$key);
                })
        });
        this.subcardlists.forEach(sub => {
            this.dataService.deleteSubCard(sub.$key);
        })
        this.dataService.deleteCardlist(this.item.$key);
        this.dataService.getCardLists().subscribe(p => {
            var carp = p.filter(cardlist => cardlist.projectId == (this.item.projectId))
            this.resetOrder(carp);
        });
    }

    cardDropped(ev) {
        let card: Card = ev.dragData;
        if (card.cardListId !== this.item.$key) {
            card.cardListId = this.item.$key;
            this.dataService.updateCard(card.$key, { cardListId: card.cardListId });
        }
    }

    cardDropped2(ev, subcardlist) {
        let card: Card = ev.dragData;
        if (card.cardListId !== subcardlist.$key) {
            card.cardListId = subcardlist.$key;
            this.dataService.updateCard(card.$key, { cardListId: card.cardListId });
        }
        this.loadCardWithSublists();
    }

    allowDragFunction(card: Card) {
        return this.allowedDragTo;
    }

    allowDropFunction(): any {
        return (dragData: Card) => {
            return this.allowedDropFrom.indexOf(dragData.cardListId) > -1;
        };
    }

    addSubcardlists(
        name: string) {
        let created_at = new Date().toString();
        let newSubCardList: SubCardList = new SubCardList();
        newSubCardList.name = name;
        newSubCardList.cardlistId = this.item.$key;
        newSubCardList.order = this.subcardlists.length;
        newSubCardList.created_at = created_at;
        this.dataService.addSubCardList(newSubCardList);
    }

    saveAddSubCardList() {
        this.addSubcardlists(this.subcardlistname);
        this.toShowAddSubCardList = false;

    }

    showAddSubCardList() {
        this.subcardlistname = '';
        this.toShowAddSubCardList = true;
    }

    cancelAddSubCardList() {
        this.toShowAddSubCardList = false;
    }

}
