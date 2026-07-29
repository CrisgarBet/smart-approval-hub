# Guía de Power Apps

## Custom Connector

1. Publica **únicamente** el gateway `localhost:3000` mediante HTTPS y configura una `POWER_APPS_DEMO_KEY` fuerte.
2. Genera el Swagger importable: `.\power-platform\scripts\set-public-url.ps1 -PublicUrl "https://tu-host-publico"`.
3. Importa `power-platform/generated/apiDefinition.swagger.json` en **Custom connectors > New custom connector > Import OpenAPI**.
4. Usa `apiProperties.json` como referencia para la conexión API key y prueba `PowerAppsHealth`, `ListRequests`, `GetMetrics` y `CreateRequest`.
5. Crea una Canvas App tipo tableta y agrega la conexión **Smart Approval Hub Demo**.

El simulador local http://localhost:4201/power-apps-demo no es Power Apps, pero consume los mismos endpoints y mantiene los mismos `operationId`.

## Fórmulas Power Fx

Al iniciar:

```powerfx
ClearCollect(
    colSolicitudes,
    SmartApprovalHub.ListRequests().items
);
Set(
    varMetricas,
    SmartApprovalHub.GetMetrics()
)
```

Filtro de galería:

```powerfx
Filter(
    colSolicitudes,
    IsBlank(ddEstado.Selected.Value) ||
    status = ddEstado.Selected.Value
)
```

Crear:

```powerfx
IfError(
    Set(
        varNuevaSolicitud,
        SmartApprovalHub.CreateRequest(
            {
                requesterName: txtSolicitante.Text,
                requesterEmail: txtCorreo.Text,
                concept: txtConcepto.Text,
                description: txtDescripcion.Text,
                amount: Value(txtMonto.Text),
                costCenter: txtCentroCostos.Text
            }
        )
    );
    Notify("Solicitud creada: " & varNuevaSolicitud.status, NotificationType.Success),
    Notify("No fue posible crear la solicitud", NotificationType.Error)
)
```

Recargar y navegar:

```powerfx
ClearCollect(colSolicitudes, SmartApprovalHub.ListRequests().items);
Set(varSolicitud, ThisItem);
Navigate(scrDetalle, ScreenTransition.Cover)
```

Aprobar:

```powerfx
IfError(
    Set(varSolicitud, SmartApprovalHub.ApproveRequest(ThisItem.id, {}));
    Notify("Solicitud aprobada", NotificationType.Success),
    Notify("No se pudo aprobar", NotificationType.Error)
)
```

Rechazar (el nombre `rejectionComment` coincide con Swagger):

```powerfx
If(
    IsBlank(Trim(txtComentario.Text)),
    Notify("Escribe un comentario", NotificationType.Warning),
    IfError(
        Set(
            varSolicitud,
            SmartApprovalHub.RejectRequest(
                ThisItem.id,
                { rejectionComment: txtComentario.Text }
            )
        );
        ClearCollect(colSolicitudes, SmartApprovalHub.ListRequests().items);
        Notify("Solicitud rechazada", NotificationType.Success),
        Notify("No se pudo rechazar", NotificationType.Error)
    )
)
```

Las fórmulas usan comas como separador de argumentos. En regiones que usan coma decimal, Power Fx muestra `;` para argumentos y `;;` para encadenar acciones; adapta únicamente los separadores, no los nombres de operaciones o propiedades. Confirma las firmas finales en el autocompletado después de agregar la conexión.
