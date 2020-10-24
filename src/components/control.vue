<template>
    <div class="outter clearfix">
        <div class="imgCheckBox">
            <div>
                <file-input multiple accept='image/*' :uploader="uploader">
                    <span class="icon ion-upload"> 選擇圖片</span>
                </file-input>
                <div class="sendBtn" @click="sendImg">上傳</div>
            </div>
            <img :src="url" alt="" />
        </div>
        <div class="controlBox">
            <table v-if="imageSort.length>0">
            <thead>
                <tr>
                    <th>圖片</th>
                    <th>上傳時間</th>
                    <th>順序<div class="sortBtn" @click="saveOrder">排序儲存</div></th>
                    <th>刪除</th>
                </tr>
            </thead>
                <tr v-for="(item, index) in imageSort" :key=item.stamp>
                    <td><img :src="item.url" alt=""></td>
                    <td>{{item.time}}</td>
                    <td><input type="number" :id="item.id" class="order" :value="index+1" min=1 :max="imageSort.length"></td>
                    <td><i class="fas fa-trash-alt" @click="deleteItem(item.id,item.name)"></i></td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import FineUploaderTraditional from "fine-uploader-wrappers";
import FileInput from 'vue-fineuploader/file-input';

import { db } from "../db";
const fStore = db.firestore();
import Firebase from 'firebase';
import { mapGetters, mapActions } from "vuex";

export default {
    name: "control",
    components: {
        FileInput,
    },
    data() {
        return {
            gallery: {},
            file: {},
            url: "",
            orderList: [],
            uploader: new FineUploaderTraditional({
                options: {
                    autoUpload: false,
                    request: {
                        endpoint: "http://localhost:8000/uploads",
                    },
                    validation: {
                        allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
                    },
                },
            }),
        };
    },
    firestore: {
        documents: fStore.collection('images'),
    },
    computed: {
    ...mapGetters(['imageSort']),
    },
    mounted() {
        let vm = this;
        let imgInput = document.querySelector('.vue-fine-uploader-file-input input');
        imgInput.addEventListener('change',function(e){
            console.log(e);
            console.log( e.srcElement.files[0]);
            console.log( e.target.files[0]);
            const file = e.srcElement.files[0];
            const imgURL = window.URL.createObjectURL(file);
            vm.url = imgURL;
            vm.file = e.target.files[0];
        })
    },
    methods: {
        ...mapActions(['getIdList']),
        imgUp(e){
            const file = event.srcElement.files[0];
            const imgURL = window.URL.createObjectURL(file);
            this.url = imgURL;
            this.file = e.target.files[0];
        },
        sendImg(){
            let vm = this;
            console.log(vm.file.name);
            const storageRef = Firebase.storage().ref(`photo/${vm.file.name}`);
            const task = storageRef.put(vm.file);
            task.on("state_changed",
                function progress(snapshot) { }, function error(err) { console.log(err);},
                function complete() {
                    storageRef.getDownloadURL()
                    .then(function(url) {
                        console.log("imageUrl",url);
                        let creatTime = new Date();
                        let imgData = { name: vm.file.name,
                                        stamp: Math.floor(Date.now()) ,
                                        url:url,
                                        order:null,
                                        time:creatTime.toLocaleString()
                                      }
                        fStore.collection('images').add(imgData);
                    })
                    .then(() => {
                        vm.getIdList();
                        vm.url = "";
                        alert("上傳成功");
                    });
                }
            )
        },
        deleteItem(id,name) {
            fStore.collection('images')
            .doc(id).delete()
            .then(()=> {
                let storageRef = Firebase.storage().ref()
                let desertRef = storageRef.child(`photo/${name}`);
                desertRef.delete() })
            .then(()=>{
                this.getIdList();
            })
        },
        saveOrder() {
            let orderlist = document.querySelectorAll('.order');
            let listNum = [];
            let setList = [];

            try{ orderlist.forEach(item =>{
                listNum.push(item.value)
                let status = checkDuplicate(listNum);
                if(status) {
                    throw new Error("請確認是否有重複順序");
                }
                let setting = { id: item.id,
                            order: item.value };
                setList.push(setting);
            })
            }
            catch(e){
                alert(e);
            }
            if(setList.length !== orderlist.length) {
                return
            }
            setList.forEach((item,index)=>{
                if(item.order !== this.imageSort[index].order) {
                    console.log("noooooooooo");
                    fStore.collection('images').doc(item.id)
                    .update({ order: item.order})
                    .then(()=>{
                        this.getIdList();
                        console.log('Document successfully updated!')})
                }
            })

            // 判斷順序是否重複 
            function checkDuplicate(arr) {
                return arr.some((val, idx) => {
                    return arr.includes(val, idx + 1);
                });
            }
        }
    },   
    created() {
        this.getIdList();
    },
};
</script>

<style scoped>

img {
    width: 50%;
}

i {
    font-size: 1.5rem;
    cursor: pointer;
}

i:hover {
    color: #E57CA7 ;
}

table,tr, th {
  /* border: 3px solid #167F92; */
  border-collapse: collapse;
  background-color: #323C50;
}

th {
    padding: 7px;
    background-color: #2C3446;
}

tr img {
    width: 50%;
}

td {
    padding: 10px 0;
    width: 200px;
    text-align: center;
}

tr>td:first-of-type {
    width: 200px;
}

tr>td:last-of-type {
    width: 50px;
}

.vue-fine-uploader-file-input,
.sendBtn,
.sortBtn {
    display: inline-block;
    margin-left: 10px;
    padding: 5px 0;
    line-height: 30px;
    border-radius: 5px;
    background-color: #77BD83;
    font-weight: 600;
    color: #2C3446;
    width: 80px;
    height: 30px;
    cursor: pointer;
}

.vue-fine-uploader-file-input:hover,
.sendBtn:hover,
.sortBtn:hover {
    background-color: antiquewhite;

}

.imgCheckBox{
    padding: 10px;
    float: left;
    text-align: center;
    width: 40%;
    border: 3px solid #77BD83;
}
.imgCheckBox>div{
    margin-bottom: 20px;
}

.controlBox{
    float: right;
}

.controlBox input {
    text-align: center;
    font-size: 1.1rem;
}

</style>
