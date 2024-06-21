import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SimulationComponent } from './simulation.component';
import { SimulationListComponent } from './simulation-list/simulation-list.component';
import { SimulationDetailsComponent } from './simulation-details/simulation-details.component';

const routes: Routes = [{
  path: '',
  component: SimulationComponent, children: [
    { path: '', component: SimulationListComponent},
    { path: 'simulation-list', component: SimulationListComponent },
    { path: 'simulation-details', component: SimulationDetailsComponent },
    { path: 'simulation-details/:uuid/:version/:name', component: SimulationDetailsComponent },
    
    ]

},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimulationRoutingModule { }
