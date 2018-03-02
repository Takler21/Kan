import { Injectable, EventEmitter, Output, Input } from "@angular/core";
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable, } from "angularfire2";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable, Subject, ReplaySubject, AsyncSubject } from "rxjs";
import { Project } from "../models/project-info";
import { CardList } from "../models/cardlist-info";
import { SubCardList } from "../models/subcardlist-info";
import { Card } from "../models/card-info";
import { Task } from "../models/task-info";

@Injectable()
export class DataService {

    projects: FirebaseListObservable<Project[]>;
    projectsE: FirebaseObjectObservable<Project[]>;
    cardlists: FirebaseListObservable<CardList[]>;
    subcardslists: FirebaseListObservable<SubCardList[]>;
    cards: FirebaseListObservable<Card[]>;
    tasks: FirebaseListObservable<Task[]>;
    
    constructor(private af: AngularFire) {
        //console.log("DataService");
    }

    getProjects() {
        this.projects = this.af.database.list('/projects') as
            FirebaseListObservable<Project[]>;
        return this.projects;
    }

    getProjectById(projectId: string): FirebaseObjectObservable<Project> {
        return this.af.database.object(`/projects/${projectId}`) as FirebaseObjectObservable<Project>;
    }

    addProject(project) {
        return this.projects.push(project);
    }

    deleteProject(key) {
        return this.projects.remove(key);
    }

    importProject(key, value) {
        this.af.database.object(`/projects/${key}`).update(value);
    }

    importCardlist(key, value) {
        this.af.database.object(`/cardlist/${key}`).update(value);
    }

    importCards(key, value) {
        this.af.database.object(`/cards/${key}`).update(value);
    }

    importSubcardlist(key, value) {
        this.af.database.object(`/subcardlist/${key}`).update(value);
    }

    importTasks(key, value) {
        this.af.database.object(`/tasks/${key}`).update(value);
    }

    getCardLists() {
        this.cardlists = this.af.database.list('/cardlist', {
            query: {
                orderByChild: 'order'
            }
        }
        ) as
            FirebaseListObservable<CardList[]>;
        return this.cardlists;
    }

    getCardListsById(cardListId: string): FirebaseObjectObservable<CardList> {
        return this.af.database.object(`/cardlist/${cardListId}`) as FirebaseObjectObservable<CardList>;
    }

    getCardListsByOrder(order: number): FirebaseListObservable<CardList[]> {
        let _cardlist = this.af.database.list('/cardlist', {
            query: {
                orderByChild: 'order',
                equalTo: order,
            }
        }
        ) as FirebaseListObservable<CardList[]>;
        return _cardlist;
    }

    getCachedCardListsById(cardListId: string): CardList {
        return this.cardlists
            .filter(d => d.$key == cardListId)
            .map(d => d.$key) as CardList
            ;
    }

    getCardListsByProject(projectId: string) {
        let _cardlist = this.af.database.list('/cardlist', {
            query: {
                orderByChild: 'projectId',
                equalTo: projectId,
            }
        }
        ) as FirebaseListObservable<CardList[]>;
        return _cardlist
    }

    addCardList(cardlist) {
        return this.cardlists.push(cardlist);
    }

    updateCardList(key, updCardlist) {
        return this.cardlists.update(key, updCardlist);
    }

    deleteCardlist(key) {
        return this.cardlists.remove(key);
    }

    addSubCardList(cardlist) {
        return this.subcardslists.push(cardlist);
    }

    updateSubCardList(key, updSubCardList) {
        return this.subcardslists.update(key, updSubCardList);
    }

    getSubCardList() {
        this.subcardslists = this.af.database.list('/subcardlist', {
            query: {
                orderByChild: 'order'
            }
        }) as
            FirebaseListObservable<SubCardList[]>;
        return this.subcardslists;
    }

    deleteSubCard(key) {
        return this.subcardslists.remove(key);
    }

    getCards() {
        this.cards = this.af.database.list('/cards') as
            FirebaseListObservable<Card[]>;
        return this.cards;
    }

    getSubCardListsByListId(listId: string) {
        this.subcardslists = this.af.database.list('/subcardlist', {
            query: {
                orderByChild: 'cardlistId',
                equalTo: listId,
            }
        }
        ) as
            FirebaseListObservable<SubCardList[]>;
        return this.subcardslists;
    }

    getSubCardListsById(subCardlistId: string): FirebaseObjectObservable<SubCardList> {
        return this.af.database.object(`/subcardlist/${subCardlistId}`) as FirebaseObjectObservable<SubCardList>;
    }

    getCardsById(cardId: string): FirebaseObjectObservable<Card> {
        return this.af.database.object(`/cards/${cardId}`) as FirebaseObjectObservable<Card>;
    }

    getCardsByListId(listId: string) {
        this.cards = this.af.database.list('/cards', {
            query: {
                orderByChild: 'cardListId',
                equalTo: listId,
            }
        }
        ) as
            FirebaseListObservable<Card[]>;
        return this.cards;
    }
    addCard(card) {
        return this.cards.push(card);
    }
    updateCard(key, updCard) {
        return this.cards.update(key, updCard);
    }

    deleteCard(key) {
        return this.cards.remove(key);
    }

    getTasks() {
        this.tasks = this.af.database.list('/tasks') as
            FirebaseListObservable<Task[]>;
        return this.cards;
    }

    getTaskById(taskId: string): FirebaseObjectObservable<Task> {
        return this.af.database.object(`/tasks/${taskId}`) as FirebaseObjectObservable<Task>;
    }

    getTasksByCardId(cardId: string) {
        let _tasks = this.af.database.list('/tasks', {
            query: {
                orderByChild: 'cardId',
                equalTo: cardId,
            }
        }
        ) as FirebaseListObservable<Task[]>;
        return _tasks;
    }

    addTask(task) {
        return this.tasks.push(task);
    }

    updateTask(key, updTask) {
        return this.tasks.update(key, updTask);
    }

    deleteTask(key) {
        return this.tasks.remove(key);
    }

    exportJson() {
        let aux = window.URL.createObjectURL(Blob)
    }
}