import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Metrics, PurchaseRequest, RequestInput, RequestStatus } from './models';

export type PowerAppsOperation = 'PowerAppsHealth'|'ListRequests'|'GetRequest'|'CreateRequest'|'ApproveRequest'|'RejectRequest'|'GetMetrics';
export interface PowerAppsHealth { status:string;apiGateway:boolean;domainService:boolean;customConnector:string;powerAutomate:'SIMULADO'|'CONFIGURADO';endpoint:string }
export interface PowerAppsList { items:PurchaseRequest[];total:number }
export interface RestMonitorEntry { id:number;time:string;operationId:PowerAppsOperation;method:string;endpoint:string;status:number;durationMs:number;requestBody?:unknown;response:string;success:boolean }

@Injectable({ providedIn: 'root' })
export class PowerAppsConnectorService {
  private readonly http = inject(HttpClient); private readonly base = '/powerapps-api'; private sequence = 0;
  readonly endpoint = this.base; readonly logs = signal<RestMonitorEntry[]>([]);
  health() { return this.execute<PowerAppsHealth>('PowerAppsHealth','GET','/health'); }
  listRequests(status?:RequestStatus|'',search='') { const params:Record<string,string>={};if(status)params['status']=status;if(search.trim())params['search']=search.trim();return this.execute<PowerAppsList>('ListRequests','GET','/requests',undefined,params); }
  getRequest(id:string) { return this.execute<PurchaseRequest>('GetRequest','GET',`/requests/${id}`); }
  createRequest(body:RequestInput) { return this.execute<PurchaseRequest>('CreateRequest','POST','/requests',body); }
  approveRequest(id:string,body:{comment?:string}={}) { return this.execute<PurchaseRequest>('ApproveRequest','PATCH',`/requests/${id}/approve`,body); }
  rejectRequest(id:string,rejectionComment:string) { return this.execute<PurchaseRequest>('RejectRequest','PATCH',`/requests/${id}/reject`,{rejectionComment}); }
  getMetrics() { return this.execute<Metrics>('GetMetrics','GET','/metrics'); }
  clearMonitor() { this.logs.set([]); }
  private execute<T>(operationId:PowerAppsOperation,method:string,path:string,body?:unknown,params?:Record<string,string>):Observable<T>{const started=performance.now();return this.http.request<T>(method,`${this.base}${path}`,{body,params,observe:'response'}).pipe(tap(response=>this.record(operationId,method,path,response.status,started,body,this.summarize(response.body),true)),map((response:HttpResponse<T>)=>response.body as T),catchError((error:HttpErrorResponse)=>{this.record(operationId,method,path,error.status||0,started,body,error.error?.message??error.message,false);return throwError(()=>error);}));}
  private record(operationId:PowerAppsOperation,method:string,endpoint:string,status:number,started:number,body:unknown,response:string,success:boolean){const requestBody=body&&typeof body==='object'?{...(body as Record<string,unknown>),...('requesterEmail' in (body as object)?{requesterEmail:'[oculto]'}:{})}:body;const entry:RestMonitorEntry={id:++this.sequence,time:new Date().toLocaleTimeString('es-CO',{hour12:false}),operationId,method,endpoint,status,durationMs:Math.round(performance.now()-started),requestBody,response,success};this.logs.update(items=>[entry,...items].slice(0,30));}
  private summarize(body:unknown){if(Array.isArray(body))return `${body.length} elementos`;if(body&&typeof body==='object'){const value=body as Record<string,unknown>;if(Array.isArray(value['items']))return `${value['items'].length} solicitudes`;if(value['status'])return `estado: ${value['status']}`;if(value['total']!==undefined)return `total: ${value['total']}`;return 'respuesta recibida';}return String(body??'sin contenido');}
}
