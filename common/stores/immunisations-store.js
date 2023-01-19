var BaseStore = require('./_store');
const data = require('../data/_data.js');

var controller = {
        get: function () {
            store.loading();
            return data.get(Project.api + 'user/' + AccountStore.getUserId() + '/immunisations')
                .then((res)=> {
                    store.model = res;
                    SecuredStorage.setItem('immunisations', store.model);
                    store.loaded();
                })
        },
        save: function (entry) {
            store.saving();
            return data.post(`${Project.api}user/${AccountStore.getUserId()}/immunisations`, entry)
                .then((res) => {
                    store.model = store.model || [];
                    store.model.push(res);
                    store.model = _.orderBy(store.model, h => h.immunisationDate, ['desc']);
                    SecuredStorage.setItem('immunisations', store.model);
                    store.saved();
                }).catch(_.partial(AjaxHandler.error, store));
        },
        update: function (id, entry) {
            store.saving();
            return data.put(`${Project.api}user/${AccountStore.getUserId()}/immunisations/${id}`, entry)
                .then((res) => {
                    const index = _.findIndex(store.model, h => h.id === id);
                    if (index !== -1) {
                        store.model[index] = res;
                    }
                    SecuredStorage.setItem('immunisations', store.model);
                    store.saved();
                }).catch(_.partial(AjaxHandler.error, store));
        },
        delete: function (id) {
            store.saving();
            return data.delete(`${Project.api}user/${AccountStore.getUserId()}/immunisations/${id}`)
                .then((res) => {
                    const index = _.findIndex(store.model, h => h.id === id);
                    if (index !== -1) {
                        store.model.splice(index, 1);
                    }
                    SecuredStorage.setItem('immunisations', store.model);
                    store.saved();
                }).catch(_.partial(AjaxHandler.error, store));
        },
    },
    store = _.assign({}, BaseStore, {
        id: 'immunisations',

        getImmunisations: function () {
            return this.model;
        },

        dispatcherIndex: Dispatcher.register(this, function (payload) {
            var action = payload.action;
            switch (action.actionType) {
                case Actions.GET_INS_IMMUNISATIONS:
                    controller.get();
                    break;
                case Actions.SAVE_INS_IMMUNISATION:
                    controller.save(action.immunisation);
                    break;
                case Actions.UPDATE_INS_IMMUNISATION:
                    controller.update(action.id, action.immunisation);
                    break;
                case Actions.DELETE_INS_IMMUNISATION:
                    controller.delete(action.id);
                    break;
                case Actions.CONNECTED:
                    store.model && controller.get();
                    break;
                case Actions.LOGOUT:
                    store.model = null;
                    break
                case Actions.DATA:
                    store.model = action.data["immunisations"];
                    break;
                default:
                    return;
            }
        })
    });

controller.store = store;
module.exports = controller.store;