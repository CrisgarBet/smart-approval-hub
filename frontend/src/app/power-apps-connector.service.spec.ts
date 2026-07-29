import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PowerAppsConnectorService } from './power-apps-connector.service';

describe('PowerAppsConnectorService',()=>{
  let service:PowerAppsConnectorService;let http:HttpTestingController;
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(PowerAppsConnectorService);http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());
  it('usa ListRequests y registra la llamada en el monitor',()=>{service.listRequests('PENDIENTE','Ana').subscribe(result=>expect(result.total).toBe(0));const req=http.expectOne(r=>r.url==='/powerapps-api/requests'&&r.params.get('status')==='PENDIENTE');req.flush({items:[],total:0});expect(service.logs()[0].operationId).toBe('ListRequests');expect(service.logs()[0].status).toBe(200);});
  it('crea con CreateRequest y oculta el correo en el monitor',()=>{service.createRequest({requesterName:'Ana',requesterEmail:'ana@co.com',concept:'Equipo',description:'Detalle',amount:500000,costCenter:'TI'}).subscribe();const req=http.expectOne('/powerapps-api/requests');expect(req.request.method).toBe('POST');req.flush({id:'1',status:'APROBADA'});expect((service.logs()[0].requestBody as any).requesterEmail).toBe('[oculto]');});
  it('registra errores HTTP controlados',()=>{service.getMetrics().subscribe({error:()=>undefined});http.expectOne('/powerapps-api/metrics').flush({message:'No autorizado'},{status:401,statusText:'Unauthorized'});expect(service.logs()[0].success).toBeFalse();expect(service.logs()[0].status).toBe(401);});
});
