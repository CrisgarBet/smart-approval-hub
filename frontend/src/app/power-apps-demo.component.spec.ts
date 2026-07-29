import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { PowerAppsDemoComponent } from './power-apps-demo.component';
import { PowerAppsConnectorService } from './power-apps-connector.service';
import { PurchaseRequest } from './models';

describe('PowerAppsDemoComponent',()=>{
  const request=(status:'PENDIENTE'|'APROBADA'|'RECHAZADA'='PENDIENTE'):PurchaseRequest=>({id:'id-1',requesterName:'Ana',requesterEmail:'ana@co.com',concept:'Equipo',description:'Detalle',amount:2500000,costCenter:'TI',status,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  let api:any;
  beforeEach(async()=>{api={endpoint:'/powerapps-api',logs:signal([]),clearMonitor:jasmine.createSpy(),health:jasmine.createSpy().and.returnValue(of({status:'ok',apiGateway:true,domainService:true,customConnector:'PREPARADO',powerAutomate:'SIMULADO',endpoint:'/api/powerapps'})),listRequests:jasmine.createSpy().and.returnValue(of({items:[request()],total:1})),getMetrics:jasmine.createSpy().and.returnValue(of({total:1,pending:1,approved:0,rejected:0,totalAmount:2500000})),getRequest:jasmine.createSpy().and.returnValue(of(request())),createRequest:jasmine.createSpy().and.returnValue(of(request('APROBADA'))),approveRequest:jasmine.createSpy().and.returnValue(of(request('APROBADA'))),rejectRequest:jasmine.createSpy().and.returnValue(of(request('RECHAZADA')))};await TestBed.configureTestingModule({imports:[PowerAppsDemoComponent],providers:[provideRouter([]),{provide:PowerAppsConnectorService,useValue:api}]}).compileComponents();});
  it('carga estado, listado y métricas inicialmente',()=>{const fixture=TestBed.createComponent(PowerAppsDemoComponent);fixture.detectChanges();expect(api.health).toHaveBeenCalled();expect(api.listRequests).toHaveBeenCalled();expect(fixture.nativeElement.textContent).toContain('Simulador local de integración con Power Apps');expect(fixture.nativeElement.textContent).toContain('Ana');});
  it('crea una solicitud mediante CreateRequest',()=>{const c=TestBed.createComponent(PowerAppsDemoComponent).componentInstance;c.form.setValue({requesterName:'Ana',requesterEmail:'ana@co.com',concept:'Equipo',description:'Detalle',amount:500000,costCenter:'TI'});c.create();expect(api.createRequest).toHaveBeenCalled();expect(c.message()).toContain('APROBADA');});
  it('aprueba y rechaza mediante operaciones dedicadas',()=>{spyOn(window,'confirm').and.returnValue(true);const c=TestBed.createComponent(PowerAppsDemoComponent).componentInstance;c.selected.set(request());c.approve();expect(api.approveRequest).toHaveBeenCalledWith('id-1',{});c.selected.set(request());c.rejectionComment='Sin presupuesto';c.reject();expect(api.rejectRequest).toHaveBeenCalledWith('id-1','Sin presupuesto');});
  it('muestra un error controlado cuando falla la carga',()=>{api.listRequests.and.returnValue(throwError(()=>({status:503,error:{message:'Dominio no disponible'}})));const c=TestBed.createComponent(PowerAppsDemoComponent).componentInstance;c.refresh();expect(c.error()).toBe('Dominio no disponible');expect(c.loading()).toBeFalse();});
});
