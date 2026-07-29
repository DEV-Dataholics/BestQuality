document.addEventListener('alpine:init', () => {
    Alpine.data('bqsApp', () => ({
        isLoggedIn: false,
        userEmail: '',
        userRole: '',
        loginEmail: '',
        loginError: '',
        activePage: 'resumen',

        // Data arrays
        dashboardData: {
            resumen: { facturado_mes: 0.00, falta_facturar: 0.00, deudor_total: 0.00 },
            desglose_por_facturar: []
        },
        clientes: [],
        cotizaciones: [],
        devengado: [],
        facturasData: [],
        pagosData: [],
        reportData: { pesos: [], dolares: [], totales: {} },

        // Detalle Factura
        selectedFactura: {},
        selectedFacturaPagos: [],

        // Carga & Importación
        csvStatus: '',
        xmlStatus: '',
        reconciliationLogs: [],
        tempXmlFile: null,

        // CRUD Modals and forms state
        showModal: null, // 'cliente', 'cotizacion', 'devengado', 'factura', 'pago'
        isEdit: false,
        crudError: '',

        clientForm: { ID_Cliente: '', Nombre_Fiscal: '', Nombre_Comercial: '', RFC: '', Estatus: 'Activo' },
        cotizacionForm: { ID_Cotizacion: '', ID_Cliente: '', PO_Referencia: '', Monto_Autorizado: 0, Piezas_Autorizadas: 0, Estatus: 'Pendiente PO' },
        devengadoForm: { ID_Captura: '', Fecha: '', ID_Cotizacion: '', Horas_Trabajadas: 0, Piezas_Sorteadas: 0, Monto_Devengado: 0, Estatus_Facturacion: 'Pendiente' },
        facturaForm: { Folio_Factura: '', cfdiUUID: '', ID_Cliente: '', Fecha_Emision: '', Monto_Subtotal: 0, Monto_Total: 0, Moneda: 'Peso Mexicano', Fecha_Vencimiento: '', Estatus_Pago: 'Vigente' },
        pagoForm: { ID_Pago: '', Folio_Factura: '', Fecha_Pago: '', Monto_Pagado: 0, Referencia: '' },

        // Filters
        filters: {
            clientes: { search: '', estatus: '' },
            cotizaciones: { search: '', cliente: '', estatus: '' },
            devengado: { search: '', cliente: '', start: '', end: '' },
            facturas: { search: '', cliente: '', estatus: '' },
            pagos: { search: '', factura: '' },
            porfacturar: { search: '', cliente: '' },
            porcobrar: { search: '', cliente: '' }
        },

        init() {
            const savedEmail = localStorage.getItem('bqs_user_email');
            const savedRole = localStorage.getItem('bqs_user_role');
            if (savedEmail && savedRole) {
                this.isLoggedIn = true;
                this.userEmail = savedEmail;
                this.userRole = savedRole;
                this.loadAllData();
            }
        },

        handleLogin() {
            this.loginError = '';
            const formData = new FormData();
            formData.append('email', this.loginEmail);

            fetch('/api/login', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error de autenticación'); });
                }
                return res.json();
            })
            .then(data => {
                this.isLoggedIn = true;
                this.userEmail = data.email;
                this.userRole = data.role;
                localStorage.setItem('bqs_user_email', data.email);
                localStorage.setItem('bqs_user_role', data.role);
                this.loadAllData();
                this.navigate('resumen');
            })
            .catch(err => {
                this.loginError = err.message;
            });
        },

        handleLogout() {
            fetch('/api/logout', { method: 'POST' })
            .then(() => {
                this.isLoggedIn = false;
                this.userEmail = '';
                this.userRole = '';
                localStorage.removeItem('bqs_user_email');
                localStorage.removeItem('bqs_user_role');
            });
        },

        navigate(page) {
            this.activePage = page;
            this.loadAllData();
        },

        loadAllData() {
            if (!this.isLoggedIn) return;

            // 1. Cargar Dashboard
            fetch('/api/dashboard/resumen')
                .then(res => res.json())
                .then(data => { this.dashboardData = data; });

            // 2. Cargar Clientes
            fetch('/api/clientes')
                .then(res => res.json())
                .then(data => { this.clientes = data; });

            // 3. Cargar Cotizaciones
            fetch('/api/cotizaciones')
                .then(res => res.json())
                .then(data => { this.cotizaciones = data; });

            // 4. Cargar Devengado
            fetch('/api/devengado')
                .then(res => res.json())
                .then(data => { this.devengado = data; });

            // 5. Cargar Facturas
            fetch('/api/facturas')
                .then(res => res.json())
                .then(data => { this.facturasData = data; });

            // 6. Cargar Pagos
            fetch('/api/pagos')
                .then(res => res.json())
                .then(data => { this.pagosData = data; });

            // 7. Cargar Reportes
            fetch('/api/reportes/resumen')
                .then(res => res.json())
                .then(data => { this.reportData = data; });
        },

        viewFacturaDetail(folio) {
            fetch(`/api/facturas/${folio}`)
                .then(res => res.json())
                .then(data => {
                    this.selectedFactura = data.factura;
                    this.selectedFacturaPagos = data.pagos;
                    this.activePage = 'factura_detalle';
                });
        },

        // ------------------------------------------------------------------------
        // CRUD ACTIONS
        // ------------------------------------------------------------------------
        openAddModal(type) {
            this.showModal = type;
            this.isEdit = false;
            this.crudError = '';
            
            if (type === 'cliente') {
                this.clientForm = { ID_Cliente: '', Nombre_Fiscal: '', Nombre_Comercial: '', RFC: '', Estatus: 'Activo' };
            } else if (type === 'cotizacion') {
                this.cotizacionForm = { ID_Cotizacion: '', ID_Cliente: '', PO_Referencia: '', Monto_Autorizado: 0, Piezas_Autorizadas: 0, Estatus: 'Pendiente PO' };
            } else if (type === 'devengado') {
                this.devengadoForm = { ID_Captura: '', Fecha: new Date().toISOString().split('T')[0], ID_Cotizacion: '', Horas_Trabajadas: 0, Piezas_Sorteadas: 0, Monto_Devengado: 0, Estatus_Facturacion: 'Pendiente' };
            } else if (type === 'factura') {
                this.facturaForm = { Folio_Factura: '', cfdiUUID: '', ID_Cliente: '', Fecha_Emision: new Date().toISOString().split('T')[0], Monto_Subtotal: 0, Monto_Total: 0, Moneda: 'Peso Mexicano', Fecha_Vencimiento: '', Estatus_Pago: 'Vigente' };
            } else if (type === 'pago') {
                this.pagoForm = { ID_Pago: '', Folio_Factura: '', Fecha_Pago: new Date().toISOString().split('T')[0], Monto_Pagado: 0, Referencia: '' };
            }
        },

        openEditModal(type, item) {
            this.showModal = type;
            this.isEdit = true;
            this.crudError = '';

            if (type === 'cliente') {
                this.clientForm = { ...item };
            } else if (type === 'cotizacion') {
                this.cotizacionForm = { ...item };
            } else if (type === 'devengado') {
                this.devengadoForm = { ...item };
            } else if (type === 'factura') {
                this.facturaForm = { ...item };
            } else if (type === 'pago') {
                this.pagoForm = { ...item };
            }
        },

        saveItem(type) {
            let url = `/api/${type === 'devengado' ? 'devengado' : type === 'pago' ? 'pagos' : type + 's'}`;
            let id = '';
            
            if (this.isEdit) {
                if (type === 'cliente') id = this.clientForm.ID_Cliente;
                if (type === 'cotizacion') id = this.cotizacionForm.ID_Cotizacion;
                if (type === 'devengado') id = this.devengadoForm.ID_Captura;
                if (type === 'factura') id = this.facturaForm.Folio_Factura;
                if (type === 'pago') id = this.pagoForm.ID_Pago;
                url += `/update/${encodeURIComponent(id)}`;
            }

            const form = new FormData();
            const dataObj = type === 'cliente' ? this.clientForm :
                            type === 'cotizacion' ? this.cotizacionForm :
                            type === 'devengado' ? this.devengadoForm :
                            type === 'factura' ? this.facturaForm : this.pagoForm;

            Object.keys(dataObj).forEach(key => {
                form.append(key, dataObj[key]);
            });

            fetch(url, {
                method: 'POST',
                body: form
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error al guardar.'); });
                }
                return res.json();
            })
            .then(() => {
                this.showModal = null;
                this.loadAllData();
            })
            .catch(err => {
                this.crudError = err.message;
            });
        },

        deleteItem(type, id) {
            if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
            
            let url = `/api/${type === 'devengado' ? 'devengado' : type === 'pago' ? 'pagos' : type + 's'}/delete/${encodeURIComponent(id)}`;
            
            fetch(url, { method: 'POST' })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error al eliminar.'); });
                }
                return res.json();
            })
            .then(() => {
                this.loadAllData();
                if (type === 'pago' && this.selectedFactura && this.selectedFactura.Folio_Factura) {
                    this.viewFacturaDetail(this.selectedFactura.Folio_Factura);
                }
            })
            .catch(err => {
                alert(err.message);
            });
        },

        // ------------------------------------------------------------------------
        // FILE UPLOADS
        // ------------------------------------------------------------------------
        uploadCSV(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.csvStatus = 'Subiendo y procesando archivo CSV...';
            const formData = new FormData();
            formData.append('csv_file', file);

            fetch('/api/importar/csv', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                this.csvStatus = data.message || 'CSV importado correctamente.';
                this.loadAllData();
            })
            .catch(err => {
                this.csvStatus = 'Error al subir el archivo CSV: ' + err.message;
            });
        },

        uploadXML(event, force = false) {
            const file = (event && event.target && event.target.files) ? event.target.files[0] : null;
            if (file) {
                this.tempXmlFile = file;
            }
            if (!this.tempXmlFile) return;

            this.xmlStatus = 'Procesando complemento XML de conciliación...';
            this.reconciliationLogs = [];
            const formData = new FormData();
            formData.append('xml_file', this.tempXmlFile);
            if (force) {
                formData.append('force', 'true');
            }

            fetch('/api/importar/xml', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error de conciliación'); });
                }
                return res.json();
            })
            .then(data => {
                if (data.status === 'warning') {
                    this.xmlStatus = 'Atención: Riesgo de pago duplicado detectado.';
                    const dupsList = data.duplicates.map(d => `Factura: ${d.Folio_Factura}, Fecha: ${d.Fecha_Pago}, Monto: ${this.formatCurrency(d.Monto_Pagado)}`).join('\n');
                    if (confirm(`¡Atención! Existe riesgo de pagos duplicados.\n\nLos siguientes pagos ya están registrados:\n${dupsList}\n\n¿Deseas forzar la importación de todos modos?`)) {
                        this.uploadXML(null, true);
                    } else {
                        this.xmlStatus = 'Importación cancelada por riesgo de duplicado.';
                    }
                    return;
                }
                this.xmlStatus = `Conciliación completa: se registraron ${data.conciliados} abonos/liquidaciones.`;
                this.reconciliationLogs = data.logs || [];
                this.loadAllData();
            })
            .catch(err => {
                this.xmlStatus = 'Error de validación: ' + err.message;
            });
        },

        // ------------------------------------------------------------------------
        // EXPORT
        // ------------------------------------------------------------------------
        exportReportToCSV() {
            let csv = 'REPORTE EJECUTIVO DE CUENTAS BQS\n\n';
            
            // Pesos
            csv += 'CLIENTE (PESOS),Facturado,Pagado,Pendiente Pago\n';
            this.reportData.pesos.forEach(r => {
                csv += `"${r.Cliente}",${r.facturado},${r.pagado},${r.pend_pago}\n`;
            });
            csv += `TOTAL PESOS,${this.reportData.totales.pesos_facturado},${this.reportData.totales.pesos_pagado},${this.reportData.totales.pesos_pendiente}\n\n`;

            // Dólares
            csv += 'CLIENTE (DOLARES),Facturado,Pagado,Pendiente Pago\n';
            this.reportData.dolares.forEach(r => {
                csv += `"${r.Cliente}",${r.facturado},${r.pagado},${r.pend_pago}\n`;
            });
            csv += `TOTAL DOLARES,${this.reportData.totales.dolares_facturado},${this.reportData.totales.dolares_pagado},${this.reportData.totales.dolares_pendiente}\n`;

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `Reporte_Ejecutivo_BQS_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        exportReportToPDF() {
            const element = document.getElementById('reporte-ejecutivo-content');
            if (!element) return;
            
            this.xmlStatus = 'Generando archivo PDF...';
            
            const opt = {
                margin:       10,
                filename:     `Reporte_Ejecutivo_BQS_${new Date().toISOString().split('T')[0]}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
            };
            
            html2pdf().from(element).set(opt).save()
            .then(() => {
                this.xmlStatus = 'PDF descargado con éxito.';
            })
            .catch(err => {
                this.xmlStatus = 'Error al exportar PDF: ' + err.message;
            });
        },

        // ------------------------------------------------------------------------
        // GETTERS & FORMATTERS
        // ------------------------------------------------------------------------
        getPageTitle() {
            return {
                resumen: 'Resumen Financiero Ejecutivo',
                porfacturar: 'Trabajo Devengado por Facturar',
                porcobrar: 'Cuentas por Cobrar Activas',
                clientes: 'Directorio de Clientes',
                cotizaciones: 'Cotizaciones Autorizadas',
                devengado: 'Bitácora de Sorteo Diario',
                facturas: 'Control de Facturas',
                factura_detalle: 'Detalle de Cobros de Factura',
                importar: 'Carga de Archivos e Importación',
                reportes: 'Reportes de Cobranza'
            }[this.activePage] || 'Portal BQS';
        },

        getUserInitials() {
            if (!this.userEmail) return 'AD';
            return this.userEmail.slice(0, 2).toUpperCase();
        },

        formatCurrency(value) {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 2
            }).format(value) + ' MXN';
        },

        formatUSD(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(value) + ' USD';
        },

        // ------------------------------------------------------------------------
        // FILTERED LIST GETTERS
        // ------------------------------------------------------------------------
        getFilteredClientes() {
            return this.clientes.filter(c => {
                const matchSearch = !this.filters.clientes.search || 
                    c.Nombre_Comercial.toLowerCase().includes(this.filters.clientes.search.toLowerCase()) ||
                    c.Nombre_Fiscal.toLowerCase().includes(this.filters.clientes.search.toLowerCase()) ||
                    c.RFC.toLowerCase().includes(this.filters.clientes.search.toLowerCase());
                const matchEstatus = !this.filters.clientes.estatus || c.Estatus === this.filters.clientes.estatus;
                return matchSearch && matchEstatus;
            });
        },

        getFilteredCotizaciones() {
            return this.cotizaciones.filter(c => {
                const matchSearch = !this.filters.cotizaciones.search || 
                    c.ID_Cotizacion.toLowerCase().includes(this.filters.cotizaciones.search.toLowerCase()) ||
                    (c.PO_Referencia && c.PO_Referencia.toLowerCase().includes(this.filters.cotizaciones.search.toLowerCase()));
                const matchCliente = !this.filters.cotizaciones.cliente || c.ID_Cliente === this.filters.cotizaciones.cliente;
                const matchEstatus = !this.filters.cotizaciones.estatus || c.Estatus === this.filters.cotizaciones.estatus;
                return matchSearch && matchCliente && matchEstatus;
            });
        },

        getFilteredDevengado() {
            return this.devengado.filter(d => {
                const matchSearch = !this.filters.devengado.search || 
                    d.ID_Captura.toLowerCase().includes(this.filters.devengado.search.toLowerCase()) ||
                    d.ID_Cotizacion.toLowerCase().includes(this.filters.devengado.search.toLowerCase());
                
                const c = this.cotizaciones.find(cot => cot.ID_Cotizacion === d.ID_Cotizacion);
                const matchCliente = !this.filters.devengado.cliente || (c && c.ID_Cliente === this.filters.devengado.cliente);
                
                const matchStart = !this.filters.devengado.start || d.Fecha >= this.filters.devengado.start;
                const matchEnd = !this.filters.devengado.end || d.Fecha <= this.filters.devengado.end;
                
                return matchSearch && matchCliente && matchStart && matchEnd;
            });
        },

        getFilteredFacturas() {
            return this.facturasData.filter(f => {
                const matchSearch = !this.filters.facturas.search || 
                    f.Folio_Factura.toLowerCase().includes(this.filters.facturas.search.toLowerCase()) ||
                    (f.cfdiUUID && f.cfdiUUID.toLowerCase().includes(this.filters.facturas.search.toLowerCase()));
                const matchCliente = !this.filters.facturas.cliente || f.ID_Cliente === this.filters.facturas.cliente;
                const matchEstatus = !this.filters.facturas.estatus || f.Estatus_Pago === this.filters.facturas.estatus;
                return matchSearch && matchCliente && matchEstatus;
            });
        },

        getFilteredPorFacturar() {
            return this.dashboardData.desglose_por_facturar.filter(item => {
                const matchSearch = !this.filters.porfacturar.search ||
                    item.ID_Cotizacion.toLowerCase().includes(this.filters.porfacturar.search.toLowerCase()) ||
                    item.Cliente.toLowerCase().includes(this.filters.porfacturar.search.toLowerCase());
                const matchCliente = !this.filters.porfacturar.cliente || 
                    this.clientes.find(c => c.Nombre_Comercial === item.Cliente)?.ID_Cliente === this.filters.porfacturar.cliente;
                return matchSearch && matchCliente;
            });
        },

        getFilteredPorCobrar() {
            return this.facturasData.filter(f => f.Estatus_Pago !== 'Pagada').filter(item => {
                const matchSearch = !this.filters.porcobrar.search ||
                    item.Folio_Factura.toLowerCase().includes(this.filters.porcobrar.search.toLowerCase()) ||
                    item.Cliente.toLowerCase().includes(this.filters.porcobrar.search.toLowerCase());
                const matchCliente = !this.filters.porcobrar.cliente || item.ID_Cliente === this.filters.porcobrar.cliente;
                return matchSearch && matchCliente;
            });
        }
    }));
});
