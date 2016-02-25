import * as jetpack from 'fs-jetpack';
import * as path from 'path';
import * as os from 'os';

export class ModalBclController {

  constructor($log, $uibModalInstance, $scope, BCL) {
    'ngInject';

    const vm = this;
    vm.$uibModalInstance = $uibModalInstance;
    vm.$log = $log;
    vm.$scope = $scope;
    vm.BCL = BCL;
    vm.jetpack = jetpack;

    vm.selected = null;
    vm.keyword = '';

    vm.filters = {
      my: true,
      local: true,
      bcl: false,
      project: true
    };

    vm.categories = [];
    vm.getBCLCategories();

    // get measures array for Library display
    vm.$scope.display_measures = [];

    // get all measures
    vm.lib_measures = [];
    vm.lib_measures = vm.getMeasures();

    vm.$log.debug('DISPLAYMEASURES: ', vm.$scope.display_measures);

    // Library grid
    vm.libraryGridOptions = {
      columnDefs: [{
        name: 'displayName',
        displayName: 'Name',
        enableCellEdit: false,
        width: '35%'
      }, {
        name: 'location',
        displayName: '',
        enableCellEdit: false,
        width: '11%'
      }, {
        name: 'type',
        enableSorting: false,
        enableCellEdit: false,
        cellClass: 'icon-cell',
        width: '15%',
        cellTemplate: '<img ng-src="assets/images/{{grid.getCellValue(row, col)}}_icon.png" alt="{{grid.getCellValue(row, col)}}" />'
      }, {
        name: 'author',
        enableCellEdit: false,
        visible: false
      }, {
        name: 'date',
        enableCellEdit: false,
        type: 'date',
        cellFilter: 'date:"dd/MM/yyyy"',
        width: '15%'
      }, {
        name: 'status',
        enableCellEdit: false,
        cellClass: 'dropdown-button',
        cellTemplate: '../app/bcl/tempEditButtonTemplate.html',
        width: '15%'
      }, {
        name: 'add',
        enableCellEdit: false,
        cellClass: 'icon-cell',
        cellTemplate: '../app/bcl/addButtonTemplate.html',
        width: '10%'
      }],
      data: 'display_measures',
      rowHeight: 45,
      /*enableCellEditOnFocus: true,*/
      enableHiding: false,
      enableColumnMenus: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: false,
      onRegisterApi: function (gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(null, row => {
          if (row.isSelected) {
            vm.selected = row.entity;
          } else {
            // No rows selected
            vm.selected = null;
          }
        });
        gridApi.cellNav.on.navigate(null, (newRowCol, oldRowCol) => {
          vm.gridApi.selection.selectRow(newRowCol.row.entity);
        });
      }
    };
  }

  getMeasures() {
    const vm = this;
    vm.BCL.getAllMeasures().then(function(response) {
      vm.lib_measures = response;
      vm.$log.debug('measures.bcl: ', vm.lib_measures.bcl);
      vm.$log.debug('ALL MEASURES: ', vm.lib_measures);
      // set display measures
      vm.getDisplayMeasures();

    });
  }

  // get measures for display based on filter values
  getDisplayMeasures() {
    const vm = this;
    const measures = [];

    // add checked
    _.each(vm.filters, (val, key) => {
      if (val) {
        _.each(vm.lib_measures[key], m => {
          // add if not found
          if (!(_.find(measures, {uid: m.uid}))) measures.push(m);
        });
      }
    });

    // TODO: then check for updates on local measures

    vm.$scope.display_measures = measures;
    return measures;
  }

  // TODO: move most of this processing to BCL service
  getBCLCategories() {
    const vm = this;

    vm.BCL.getCategories().then(response => {

      if (response.data.term) {
        const categories = [];
        // 3 possible levels of nesting
        _.each(response.data.term, term => {
          const cat1 = _.pick(term, ['name', 'tid']);
          const cat1_terms = [];
          _.each(term.term, term2 => {
            const cat2 = _.pick(term2, ['name', 'tid']);
            const cat2_terms = [];
            _.each(term2.term, term3 => {
              const cat3 = _.pick(term3, ['name', 'tid']);
              cat2_terms.push(cat3);
            });
            cat2.children = cat2_terms;
            cat1_terms.push(cat2);
          });
          cat1.children = cat1_terms;
          categories.push(cat1);
        });

        //vm.$log.debug('Categories: ', categories);
        vm.categories = categories;

      }
    });
    // for testing until electron works
    /*
     vm.categories = [
     {name: 'A', tid: 1},
     {name: 'B', tid: 2},
     {name: 'C', tid: 3}
     ];*/
  }

  // process filter changes
  resetFilters() {
    const vm = this;
    vm.$scope.display_measures = this.getDisplayMeasures();
  }


  // add measure to project
  addMeasure(rowEntity) {

    const vm = this;
    const measure = _.find(vm.$scope.display_measures, {uid: rowEntity.uid});

    vm.$log.debug(measure);
    measure.addedToProject = true;

    // TODO: Call service to add to project
    vm.addToProject(measure);

    vm.$log.debug(vm.project_measures);

  }

  // TODO: this will be in a service
  addToProject(measure) {
    const vm = this;

    vm.lib_measures.project.push(measure);

    // copy on disk
    const src = (measure.location == 'My') ? vm.my_measures_dir : vm.local_dir;
    src.copy(measure.name, vm.project_dir.path(measure.name));

  }

  // download from BCL (via service)
  download() {
    const vm = this;
    vm.$log.debug('in DOWNLOAD function');
  }

  // edit My measure
  editMeasure() {
    const vm = this;
    vm.$log.debug('in EDIT MEASURE function');
  }

  // copy from local and edit
  copyAndEditMeasure() {
    const vm = this;
    vm.$log.debug('in COPY AND EDIT function');
  }

  ok() {
    const vm = this;

    vm.$uibModalInstance.close();
  }

  cancel() {
    const vm = this;

    vm.$uibModalInstance.dismiss('cancel');
  }

  search() {
    // first just search by keyword and display results
  }

}
