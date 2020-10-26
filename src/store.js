import Vue from 'vue';
import Vuex from 'vuex';
import { db } from "./db";
import { vuexfireMutations } from 'vuexfire';
const fStore = db.firestore();

// import Firebase from 'firebase'
// import firebase from 'firebase/app'
import 'firebase/firestore';
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        idList: [],
    },
    actions: {
        getIdList({ commit }) {
            return new Promise((resolve, reject) => {
                fStore.collection('images')
                .get()
                .then(querySnapshot => {
                    const imageDoc = querySnapshot.docs.map(doc => {
                        return { ...doc.data(),
                                 id: doc.id
                               }                          
                    });
                    commit('SET_IMAGE_DATA', imageDoc);
                    resolve();
                }) 
            })
        },
        addImageList({ dispatch }, imageListObj) {
            fStore.collection('images')
            .add({ ...imageListObj })
            .then(() => {
                return dispatch('getIdList');
            })
        },
        updateImageList({ dispatch }, imageListObj) {
            let promisesUpdate = [];
            imageListObj.forEach(item=>{
                promisesUpdate.push( updateToDb(item));
            });
            Promise.all(promisesUpdate)
            .then(() => { 
                alert("排序儲存成功!") ;
                return dispatch('getIdList');
            });

            function updateToDb(item) { 
                return new Promise((resolve, reject) => {         
                    const { id, order } = item;
                    fStore.collection('images')
                    .doc(id)
                    .update({ order: order });
                    resolve();
                })
            }
        },
        deleteImageList({ dispatch }, id) {
          return new Promise((resolve, reject) => {
            fStore.collection('images')
            .doc(id).delete()
            .then(() => {
                return dispatch('getIdList');
            })
          })
        }

    },
    mutations: {
        SET_IMAGE_DATA: function(state,data) {
            state.idList = data ;
        },
        ...vuexfireMutations
    },
    getters: {
        imageSort: state => {
            let checkSortType = state.idList.every(img => img.order !== null );
            if(checkSortType) {
                return state.idList.sort(function (a, b) {
                    return a.order > b.order ? 1 : -1 ;
                });
            }
            else {
                return state.idList.sort(function (a, b) {
                    return a.stamp > b.stamp ? 1 : -1 ;
                });
            }
        },
    },
    modules: {
    }
})
