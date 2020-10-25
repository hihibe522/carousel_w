import Vue from 'vue'
import Vuex from 'vuex'
import { db } from "./db";
import { vuexfireMutations, firestoreAction } from 'vuexfire'
const fStore = db.firestore();

// import Firebase from 'firebase'
// import firebase from 'firebase/app'
import 'firebase/firestore'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        images: [],
        idList: [],
    },
    actions: {
        bindImgRef: firestoreAction(context => {
            return context.bindFirestoreRef('images', fStore.collection('images'))
        }),
        getIdList({ commit }) {
            return new Promise((resolve, reject) => {
                fStore.collection('images')
                .get()
                .then(querySnapshot => {
                    const documents = querySnapshot.docs.map(doc => {
                        return {
                          ...doc.data(),
                          id: doc.id
                        }
                    })
                    commit('SET_IMAGE_DATA', documents)
                    resolve()
                })
                .catch(error => reject(error))
            })
        }, 
        addImageList({ dispatch }, imageListObj) {
            const { date } = imageListObj
            return new Promise((resolve, reject) => {
                fStore.collection('images')
                .add({ ...imageListObj })
                .then(() => {
                  return dispatch('getIdList', date)
                })
                .then(() => resolve())
                .catch(error => reject(error))
            })
        },
        updateImageList({ dispatch }, imageListObj) {
            const { id, date } = imageListObj
            delete imageListObj.id
            return new Promise((resolve, reject) => {
                fStore.collection('images')
                .doc(id)
                .update({
                  ...imageListObj
                })
                .then(() => {
                  return dispatch('getIdList', date)
                })
                .then(() => resolve())
                .catch(error => reject(error))
            })
        },
        deleteImageList({ dispatch }, id) {
            return new Promise((resolve, reject) => {
                fStore.collection('images')
                .doc(id)
                .delete()
                .then(() => {
                  return dispatch('getIdList')
                })
                .then(() => resolve())
                .catch(error => reject(error))
            })
        }
    },
    mutations: {
        SET_IMAGE_DATA: function(state,data){
            state.idList = data ;
        },
        ...vuexfireMutations
    },
    getters: {
        imageSort: state => {
            let checkSortType = state.idList.every(img => img.order !== null )
            if(checkSortType){
                return state.idList.sort(function (a, b) {
                    return a.order > b.order ? 1 : -1 ;
                });
            }
            else{ 
                return state.idList.sort(function (a, b) {
                    return a.stamp > b.stamp ? 1 : -1 ;
                });
            }
        },
    },
    modules: {
    }
})
