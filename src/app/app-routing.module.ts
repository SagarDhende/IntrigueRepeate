import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './shared/guards/auth.guard.';

const route:Routes=[
    // {
    //     path:'',
    //     loadChildren:()=>import('./login/login.module').then(module =>module.LoginModule)
    // },
    {
        path:'login',
        loadChildren:()=>import('./login/login.module').then(module =>module.LoginModule)
    },
    {
        path: 'embedded',
        children: [
          { path: 'dashboard', loadChildren:() => import ('./dashboard/dashboard.module').then(module => module.DashboardModule) },
          { path: 'alerts', loadChildren:() => import('./alert/alert.module').then(module => module.AlertModule) },
          { path: 'application-manager', loadChildren:() => import('./application-manager/application-manager.module').then(module => module.ApplicationManagerModule) },
          { path: 'cases', loadChildren:() => import ('./case/case.module').then(module => module.CaseModule) },
          { path: 'entities', loadChildren:() => import ('./entity/entity.module').then(module => module.EntityModule) },
          { path: 'link-analysis', loadChildren:() => import ('./link-analysis/link-analysis.module').then(module => module.LinkAnalysisModule) },
          { path: 'generative-ai', loadChildren:() => import ('./generative-ai/generative-ai.module').then(module => module.GenerativeAiModule) },
          { path: 'what-if-analysis', loadChildren:() => import('./what-if-analysis/what-if-analysis.module').then(module => module.WhatIfAnalysisModule) },
          { path: 'simulation', loadChildren:() => import ('./simulation/simulation.module').then(module => module.SimulationModule) },
          { path: 'reports', loadChildren:() => import ('./report/report.module').then(module => module.ReportModule) },
          { path: 'rules', loadChildren:() => import ('./business-rule/business-rule.module').then(module => module.BusinessRuleModule) },
          { path: 'datasets', loadChildren:() => import ('./dataset/dataset.module').then(module => module.DatasetModule) },
          { path: 'setting', loadChildren:() => import ('./setting/setting.module').then(module => module.SettingModule) },
          { path: 'data-pipeline', loadChildren: () => import ('./data-pipeline/pipeline.module').then(module => module.PipelineModule)},
        ]
      },
      

    { path: '', component: AppLayoutComponent,
       canActivate:[AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'application-manager',
                pathMatch: 'full'
            },
            {path: 'home', loadChildren:() => import ('./home/home.module').then(module => module.HomeModule)},
            {path: 'dashboard', loadChildren:() => import ('./dashboard/dashboard.module').then(module => module.DashboardModule)},
            {path: 'alerts', loadChildren:() => import('./alert/alert.module').then(module => module.AlertModule)},
            {path: 'application-manager', loadChildren:() => import('./application-manager/application-manager.module').then(module => module.ApplicationManagerModule)},
            {path: 'cases', loadChildren:() => import ('./case/case.module').then(module => module.CaseModule)},
            {path: 'entities', loadChildren:() => import ('./entity/entity.module').then(module => module.EntityModule)},
            {path: 'link-analysis', loadChildren:() => import ('./link-analysis/link-analysis.module').then(module => module.LinkAnalysisModule)},
            {path: 'generative-ai', loadChildren:() => import ('./generative-ai/generative-ai.module').then(module => module.GenerativeAiModule)},
            {path: 'what-if-analysis', loadChildren:() => import('./what-if-analysis/what-if-analysis.module').then(module => module.WhatIfAnalysisModule)},
            {path: 'simulation', loadChildren:() => import ('./simulation/simulation.module').then(module => module.SimulationModule)},
            {path: 'reports', loadChildren:() => import ('./report/report.module').then(module => module.ReportModule)},
            {path: 'rules', loadChildren:() => import ('./business-rule/business-rule.module').then(module => module.BusinessRuleModule)},
            {path: 'datasets', loadChildren:() => import ('./dataset/dataset.module').then(module => module.DatasetModule)},
            {path: 'setting',loadChildren:()=> import ('./setting/setting.module').then(module => module.SettingModule)},
            { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
            { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
            { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
            { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
            { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
            { path: 'data-pipeline', loadChildren: () => import ('./data-pipeline/pipeline.module').then(module => module.PipelineModule)},
            {
                path:'custom-menu',
                loadChildren:()=> import('./custom-menu/custom-menu.module').then(module => module.CustomMenuModule)
              },
        ]
    },
    { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
    { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
    { path: 'notfound', component: NotfoundComponent },
    { path: '**', redirectTo: '/notfound' },
]
@NgModule({
    imports: [
        //RouterModule.forRoot(route, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload',useHash: true})
        RouterModule.forRoot(route,{useHash: true})

    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
