import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Metrics, PurchaseRequest, RequestStatus } from './models';
import { PowerAppsConnectorService, PowerAppsHealth, RestMonitorEntry } from './power-apps-connector.service';
import { StatusBadgeComponent } from './status-badge.component';

@Component({standalone:true,imports:[CommonModule,ReactiveFormsModule,FormsModule,RouterLink,StatusBadgeComponent],templateUrl:'./power-apps-demo.component.html',styleUrl:'./power-apps-demo.component.css'})
export class PowerAppsDemoComponent implements OnInit {
  readonly connector=inject(PowerAppsConnectorService);private readonly fb=inject(FormBuilder);
  readonly items=signal<PurchaseRequest[]>([]);readonly metrics=signal<Metrics>({total:0,pending:0,approved:0,rejected:0,totalAmount:0});readonly health=signal<PowerAppsHealth|null>(null);readonly selected=signal<PurchaseRequest|null>(null);readonly activeLog=signal<RestMonitorEntry|null>(null);readonly loading=signal(true);readonly saving=signal(false);readonly error=signal('');readonly message=signal('');
  status:RequestStatus|''='';search='';rejectionComment='';
  readonly form=this.fb.nonNullable.group({requesterName:['',[Validators.required]],requesterEmail:['',[Validators.required,Validators.email]],concept:['',[Validators.required]],description:['',[Validators.required]],amount:[500000,[Validators.required,Validators.min(0.01)]],costCenter:['TECNOLOGÍA',[Validators.required]]});
  ngOnInit(){this.refresh();}
  refresh(){this.loading.set(true);this.error.set('');forkJoin({health:this.connector.health(),list:this.connector.listRequests(this.status,this.search),metrics:this.connector.getMetrics()}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>{this.health.set(r.health);this.items.set(r.list.items);this.metrics.set(r.metrics)},error:e=>this.error.set(e.error?.message??'No fue posible conectar con los endpoints de Power Apps.')});}
  create(){if(this.form.invalid){this.form.markAllAsTouched();return;}this.saving.set(true);this.clearMessages();this.connector.createRequest(this.form.getRawValue()).pipe(finalize(()=>this.saving.set(false))).subscribe({next:r=>{this.selected.set(r);this.message.set(`CreateRequest completado: solicitud ${r.status}.`);this.refreshData();},error:e=>this.showError(e)});}
  view(id:string){this.clearMessages();this.connector.getRequest(id).subscribe({next:r=>this.selected.set(r),error:e=>this.showError(e)});}
  approve(){const current=this.selected();if(!current||!confirm('¿Aprobar esta solicitud desde el simulador?'))return;this.saving.set(true);this.clearMessages();this.connector.approveRequest(current.id,{}).pipe(finalize(()=>this.saving.set(false))).subscribe({next:r=>{this.selected.set(r);this.message.set('ApproveRequest completado.');this.refreshData();},error:e=>this.showError(e)});}
  reject(){const current=this.selected();if(!current||!this.rejectionComment.trim()){this.error.set('El comentario de rechazo es obligatorio.');return;}if(!confirm('¿Rechazar esta solicitud desde el simulador?'))return;this.saving.set(true);this.clearMessages();this.connector.rejectRequest(current.id,this.rejectionComment).pipe(finalize(()=>this.saving.set(false))).subscribe({next:r=>{this.selected.set(r);this.rejectionComment='';this.message.set('RejectRequest completado.');this.refreshData();},error:e=>this.showError(e)});}
  demonstrateConflict(){const current=this.selected();if(!current)return;this.clearMessages();this.connector.approveRequest(current.id,{}).subscribe({next:()=>this.error.set('Respuesta inesperada: se permitió una segunda decisión.'),error:e=>this.showError(e)});}
  selectLog(log:RestMonitorEntry){this.activeLog.set(log);}
  private refreshData(){forkJoin({list:this.connector.listRequests(this.status,this.search),metrics:this.connector.getMetrics()}).subscribe({next:r=>{this.items.set(r.list.items);this.metrics.set(r.metrics)}});}
  private clearMessages(){this.error.set('');this.message.set('');}
  private showError(e:any){this.error.set(e.error?.message??`La operación falló con HTTP ${e.status||0}.`);}
}
