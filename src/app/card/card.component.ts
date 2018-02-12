import {Component, OnInit, Input, ViewChild} from "@angular/core";
import { DataService } from "app/shared/data.service";
import { ExportService } from "app/shared/export.service";
import {Observable} from "rxjs";
import {CardList} from "app/models/cardlist-info";
import {Card} from "app/models/card-info";
import {Task} from "app/models/task-info";
import { ModalDirective } from 'ng2-bootstrap/modal';

@Component({
    selector: 'card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
    @ViewChild('childModal') public childModal:ModalDirective;
    @Input() item: Card;
    tasks : Task[]

    newtaskdesc;


    constructor(private dataService: DataService, private exportService: ExportService) {
        //console.log(this.item);
    }

    ngOnInit() {
        //console.log(this.item);
        this.dataService.getTasksByCardId(this.item.$key)
            .subscribe(data => {
                this.tasks = data;
            })
    }

    addNewTask(){
        //console.log('Add new subtask!');
        let newTask = new Task();
        newTask.cardId = this.item.$key;
        newTask.description = this.newtaskdesc;
        newTask.isCompleted = false;
        newTask.order = 0;
        newTask.created_at = new Date().toString();
        this.dataService.addTask(newTask)
            .then(() => {
                this.newtaskdesc = '';
            });
        this.exportService.getJsonExport();
    }

    deleteTask(task){
        //console.log(task);
        this.dataService.deleteTask(task.$key);
        //this.childModal.show();
        this.exportService.getJsonExport();
    }
    public hideChildModal():void {
        this.childModal.hide();
    }

    changeTaskCompleted(task){
        //console.log(task);
        this.dataService.updateTask(task.$key, { isCompleted: task.isCompleted});
    }
    ////////////////////////////
    //Aqui primera intervencion.
    ////////////////////////////
    clickCarret(){
        this.item.isExpanded = !this.item.isExpanded;
        this.dataService.updateCard(this.item.$key, { isExpanded: this.item.isExpanded });
    }
}
