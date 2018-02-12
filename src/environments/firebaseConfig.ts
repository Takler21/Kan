
import {AuthMethods, AuthProviders} from "angularfire2";


export const firebaseConfig = {
    //get these from your created firebase project at https://console.firebase.google.com
    // Paste all this from the Firebase console...
    apiKey: "AIzaSyDU3vmI9rFwARJ_1CyXImAqOQJKhQsTjJc",
    authDomain: "kanban-e80b6.firebaseapp.com",
    databaseURL: "https://kanban-e80b6.firebaseio.com",
    projectId: "kanban-e80b6",
    storageBucket: "kanban-e80b6.appspot.com",
    messagingSenderId: "222646066390"
};

export const authConfig = {
    provider: AuthProviders.Password,
    method: AuthMethods.Password
};
