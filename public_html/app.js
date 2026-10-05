let chartHistorico = null;
let chartClienteMes = null;

document.addEventListener('alpine:init', () => {
    Alpine.data('bqsApp', () => ({
        isLoggedIn: false,
        userEmail: '',
        userRole: '',
        loginEmail: '',
        loginError: '',
        activePage: 'resumen',

        // Sidebar & Mobile Navigation
        isSidebarCollapsed: false,
        mobileMenuOpen: false,

        // Super Captura Wizard State
        superCapturaStep: 1,
        superCapturaForm: {
            ID_Cliente: '',
            Nombre_Fiscal: '',
            Nombre_Comercial: '',
            RFC: '',
            Direccion: '',
            CP: '',
            ID_Cotizacion: '',
            PO_Referencia: '',
            Monto_Autorizado: 0,
            Piezas_Autorizadas: 0,
            Planta: '',
            Planta_Nueva: '',
            Numero_Parte: '',
            Notas_Politicas: '',
            ID_Captura: '',
            Fecha: new Date().toISOString().split('T')[0],
            Horas_Trabajadas: 0,
            Piezas_Sorteadas: 0,
            Monto_Devengado: 0
        },

        // Pareto Toggle
        paretoView: false,
        porFacturarViewMode: 'tabla',

        // Data arrays
        dashboardData: {
            resumen: { facturado_mes: 0.00, falta_facturar: 0.00, deudor_total: 0.00 },
            desglose_por_facturar: []
        },
        clientes: [],
        plantas: [],
        cotizaciones: [],
        devengado: [],
        facturasData: [],
        pagosData: [],
        reportData: { pesos: [], dolares: [], totales: {} },

        // Charts data
        historicoFacturacion: [],
        desgloseClienteUltimoMes: [],
        selectedClientForChart: '',

        // Detalle Factura
        selectedFactura: {},
        selectedFacturaPagos: [],

        // Carga & Importación
        csvStatus: '',
        xmlStatus: '',
        reconciliationLogs: [],
        tempXmlFiles: [],

        // CRUD Modals and forms state
        showModal: null, // 'cliente', 'cotizacion', 'devengado', 'factura', 'pago'
        isEdit: false,
        crudError: '',

        DEFAULT_NOTAS: "1. Condiciones de Pago: No se aceptan cheques, pura transferencia bancaria interbancaria (SPEI).\n2. Garantía y Calidad: Best Quality Solutions garantiza que todos los servicios de sorteo e inspección de calidad se realizan bajo estrictos estándares industriales. Cualquier reclamación sobre el servicio debe presentarse dentro de las 48 horas posteriores a la realización del sorteo.\n3. Facturación: Las facturas se emitirán de acuerdo con el trabajo devengado y los reportes diarios de inspección validados.",

        selectedQuoteForPDF: null,
        selectedQuoteForPDFClient: null,
        postCaptureQuoteId: '',

        selectedFacturas: [],
        showBulkStatusModal: false,
        bulkStatusValue: 'Cancelada',

        clientForm: { ID_Cliente: '', Nombre_Fiscal: '', Nombre_Comercial: '', RFC: '', Estatus: 'Activo', Direccion: '', CP: '' },
        cotizacionForm: { ID_Cotizacion: '', ID_Cliente: '', PO_Referencia: '', Monto_Autorizado: 0, Piezas_Autorizadas: 0, Estatus: 'Pendiente', Evidencia: '', Numero_Parte: '', Planta: '', Notas_Politicas: '', Numero_Remision: '' },
        devengadoForm: { ID_Captura: '', Fecha: '', ID_Cotizacion: '', Horas_Trabajadas: 0, Piezas_Sorteadas: 0, Monto_Devengado: 0, Estatus_Facturacion: 'Pendiente' },
        facturaForm: { Folio_Factura: '', cfdiUUID: '', ID_Cliente: '', Fecha_Emision: '', Monto_Subtotal: 0, Monto_Total: 0, Moneda: 'Peso Mexicano', Fecha_Vencimiento: '', Estatus_Pago: 'Vigente' },
        pagoForm: { ID_Pago: '', Folio_Factura: '', Fecha_Pago: '', Monto_Pagado: 0, Referencia: '' },

        // Filters
        filters: {
            dashboard: { start: '', end: '', cliente: '' },
            clientes: { search: '', estatus: '' },
            cotizaciones: { search: '', cliente: '', estatus: '' },
            devengado: { search: '', cliente: '', start: '', end: '' },
            facturas: { search: '', cliente: '', estatus: '' },
            pagos: { search: '', factura: '' },
            porfacturar: { search: '', cliente: '' },
            porcobrar: { search: '', cliente: '', start: '', end: '' },
            logs: { search: '', modulo: '' },
            reportes: { start: '', end: '', cliente: '' }
        },

        pdfLang: 'es',

        quoteTranslations: {
            es: {
                doc_title: 'COTIZACIÓN / REMISIÓN',
                client_box: 'CLIENTE',
                offer_box: 'Detalles de la Oferta',
                rfc: 'RFC: ',
                address: 'Dirección: ',
                zip: 'C.P.: ',
                plant: 'Planta: ',
                part_number: 'Número de Parte: ',
                po: 'Orden Compra (PO): ',
                status: 'Estatus: ',
                col_concept: 'Concepto / Descripción',
                col_qty: 'Cantidad (Pzs)',
                col_unit_price: 'P.U. Estimado',
                col_authorized: 'Monto Autorizado',
                service_desc: 'Servicio de Inspección, Control y Sorteo de Calidad',
                subtotal: 'Subtotal:',
                tax: 'I.V.A. (16%):',
                total: 'Total (MXN):',
                terms_title: 'TÉRMINOS Y CONDICIONES',
                sig_rep: 'Representante Autorizado',
                sig_client: 'Aceptación de Cliente',
                remision: 'Remisión: ',
                date: 'Fecha: ',
                company_name: 'Best Quality Solutions México SA de CV',
                company_tagline: 'Sorting.Inspection.Rework',
                company_address: 'Fuente de Troya #4209 Col. Jardines de lago C.P. 32616 | Tel (656) 170-37-96',
                client_title: 'CLIENTE',
                plant_name: 'Planta:',
                requestor: 'Solicitante:',
                quote_title: 'COTIZACIÓN',
                number: 'Número:',
                approved_via: 'APROBADO VÍA:',
                not_approved: 'NO APROBADO',
                activity: 'ACTIVIDAD',
                sorting: 'SORTEO',
                rework: 'RETRABAJO',
                other: 'OTRO (ESPECIFICAR)',
                total_price: 'Precio Total',
                desc_job: '1. DESCRIPCIÓN DEL TRABAJO',
                location: '2. UBICACIÓN',
                quantity: '3. CANTIDAD',
                part_number_col: 'No. Parte',
                quantity_col: 'Cantidad',
                total_col: 'TOTAL',
                total_charge: 'CARGO TOTAL',
                start_date: '2. FECHA DE INICIO:',
                from_auth: 'A partir de Autorización',
                finish_date: '3. FECHA DE TÉRMINO:',
                comments: '4. COMENTARIOS ADICIONALES:',
                comments_text: 'BQS únicamente acepta pagos mediante transferencia electrónica interbancaria (SPEI). BQS NO ACEPTA CHEQUES. Favor de firmar cotización si es aprobada y anexar orden de compra.',
                additional_charges: 'CARGOS ADICIONALES',
                supervisory_fee: 'Supervisión: Incluida.',
                transport_fee: 'Flete: En caso de traslado a instalaciones BQS aplica costo extra.',
                personnel_transport: 'Transporte de Personal: Incluido.',
                special_tooling: 'Herramental o Equipo Especial: No Incluido.',
                total_cost: 'COSTO TOTAL',
                quote_validity: 'Esta cotización está sujeta a revisión 7 días a partir de la fecha de emisión.',
                bqs_responsibilities: 'Responsabilidades de BQS:',
                client_responsibilities: 'Responsabilidades del CLIENTE:',
                warranties: 'Garantías',
                idle_time: 'Tiempo Muerto',
                auth_signature: 'Yo, ___________________________ autorizo la cotización establecida arriba',
                signature: 'Firma:',
                doc_code: 'FRM BQS-08-01-C Rev. Feb 08, 2019'
            },
            en: {
                doc_title: 'QUOTE / PACKING SLIP',
                client_box: 'CLIENT',
                offer_box: 'Proposal Details',
                rfc: 'Tax ID / RFC: ',
                address: 'Address: ',
                zip: 'Zip Code: ',
                plant: 'Plant / Facility: ',
                part_number: 'Part Number: ',
                po: 'Purchase Order (PO): ',
                status: 'Status: ',
                col_concept: 'Concept / Description',
                col_qty: 'Quantity (Pcs)',
                col_unit_price: 'Est. Unit Price',
                col_authorized: 'Authorized Amount',
                service_desc: 'Quality Inspection, Containment and Sorting Services',
                subtotal: 'Subtotal:',
                tax: 'Tax / VAT (16%):',
                total: 'Total (MXN):',
                terms_title: 'TERMS AND CONDITIONS',
                sig_rep: 'Authorized Representative',
                sig_client: 'Customer Acceptance',
                remision: 'Packing Slip: ',
                date: 'Date: ',
                company_name: 'Best Quality Solutions México SA de CV',
                company_tagline: 'Sorting.Inspection.Rework',
                company_address: 'Fuente de Troya #4209 Col. Jardines de lago C.P. 32616 | Tel (656) 170-37-96',
                client_title: 'CLIENT',
                plant_name: 'Plant Name:',
                requestor: 'Requestor:',
                quote_title: 'QUOTE',
                number: 'Number:',
                approved_via: 'APPROVED VIA (EXPLAIN)',
                not_approved: 'NOT APPROVED',
                activity: 'ACTIVITY',
                sorting: 'SORTING',
                rework: 'REWORK',
                other: 'OTHER (EXPLAIN)',
                total_price: 'Total Price',
                desc_job: '1. DESCRIPTION JOB',
                location: '2. LOCATION',
                quantity: '3. QUANTITY',
                part_number_col: 'Part Number',
                quantity_col: 'Quantity',
                total_col: 'TOTAL',
                total_charge: 'TOTAL CHARGE',
                start_date: '2. START DATE:',
                from_auth: 'From Authorization',
                finish_date: '3. FINISH DATE:',
                comments: '4. ADDITIONAL COMMENTS:',
                comments_text: 'BQS only takes payments in the form of electronic transfers. BQS DOES NOT ACCEPT CHECKS. Please sign quotation if approved and send purchase order.',
                additional_charges: 'ADITIONAL CHARGES',
                supervisory_fee: 'Supervisory Fee: Included.',
                transport_fee: 'Transportation Fee: IN CASE MATERIAL HAS TO BE TRANSPORTED TO BQS FACILITIES AN EXTRA',
                personnel_transport: 'Personnel Transportation: Included.',
                special_tooling: 'Special Tooling, Equipment or Material for the Event: Not Included.',
                total_cost: 'TOTAL COST',
                quote_validity: 'This quote is subject to revision 7 days from the above date.',
                bqs_responsibilities: 'BQS Responsibilities:',
                client_responsibilities: 'CLIENT Responsibilities:',
                warranties: 'Warranties',
                idle_time: 'Idle Time',
                auth_signature: 'I, ___________________________ authorize the quote established above',
                signature: 'Signature:',
                doc_code: 'FRM BQS-08-01-C Rev. Feb 08, 2019'
            }
        },

        tQuote(key) {
            const lang = this.pdfLang || 'es';
            return (this.quoteTranslations[lang] && this.quoteTranslations[lang][key]) || key;
        },

        togglePdfLang(lang) {
            this.pdfLang = lang;
        },

        logsData: {
            audit: [],
            systemFiles: [],
            selectedFile: '',
            systemContent: '',
            activeTab: 'audit',
            loading: false,
            error: '',
            inspectingLog: null
        },

        init() {
            if (!this.filters) this.filters = {};
            if (!this.filters.reportes) {
                this.filters.reportes = { start: '', end: '', cliente: '' };
            }
            const savedEmail = localStorage.getItem('bqs_user_email');
            const savedRole = localStorage.getItem('bqs_user_role');
            if (savedEmail && savedRole) {
                this.isLoggedIn = true;
                this.userEmail = savedEmail;
                this.userRole = savedRole;
                this.loadAllData();
            }
        },

        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
            this.mobileMenuOpen = false;
            this.loadAllData();
            if (page === 'resumen') {
                this.$nextTick(() => {
                    this.initCharts();
                });
            } else if (page === 'logs') {
                this.loadAuditLogs();
                this.loadSystemLogs();
            }
        },

        loadAllData() {
            if (!this.isLoggedIn) return;

            // 1. Cargar Dashboard
            this.loadDashboard();

            // 2. Cargar Clientes
            fetch('/api/clientes')
                .then(res => res.json())
                .then(data => { 
                    this.clientes = data; 
                    if (data.length > 0 && !this.selectedClientForChart) {
                        this.selectedClientForChart = data[0].ID_Cliente;
                        this.updateClientChart();
                    }
                });

            // 2.5 Cargar Plantas
            fetch('/api/plantas')
                .then(res => res.json())
                .then(data => { this.plantas = data; });

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
            this.loadExecutiveReport();

            // 8. Cargar Facturacion Historica
            fetch('/api/reportes/historico')
                .then(res => res.json())
                .then(data => {
                    this.historicoFacturacion = data;
                    if (chartHistorico) {
                        chartHistorico.data.labels = data.map(d => d.mes);
                        chartHistorico.data.datasets[0].data = data.map(d => parseFloat(d.total));
                        chartHistorico.update();
                    }
                });
        },

        updateClientChart() {
            if (!this.selectedClientForChart) return;
            fetch(`/api/reportes/cliente-mes/${this.selectedClientForChart}`)
                .then(res => res.json())
                .then(data => {
                    this.desgloseClienteUltimoMes = data;
                    if (chartClienteMes) {
                        chartClienteMes.data.labels = data.map(d => d.fecha);
                        chartClienteMes.data.datasets[0].data = data.map(d => parseFloat(d.Monto_Total));
                        chartClienteMes.update();
                    }
                });
        },

        initCharts() {
            if (typeof Chart === 'undefined') return;

            const ctxHistorico = document.getElementById('chart-historico');
            if (ctxHistorico && !chartHistorico) {
                chartHistorico = new Chart(ctxHistorico, {
                    type: 'line',
                    data: {
                        labels: this.historicoFacturacion.map(d => d.mes),
                        datasets: [{
                            label: 'Facturación Global Histórica',
                            data: this.historicoFacturacion.map(d => parseFloat(d.total)),
                            borderColor: '#0b4f9e',
                            backgroundColor: 'rgba(11, 79, 158, 0.1)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }

            const ctxCliente = document.getElementById('chart-cliente-mes');
            if (ctxCliente && !chartClienteMes) {
                chartClienteMes = new Chart(ctxCliente, {
                    type: 'bar',
                    data: {
                        labels: this.desgloseClienteUltimoMes.map(d => d.fecha),
                        datasets: [{
                            label: 'Facturación por Cliente (Últimos 30 días)',
                            data: this.desgloseClienteUltimoMes.map(d => parseFloat(d.Monto_Total)),
                            backgroundColor: '#10b981',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
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
        // WIZARD SUPER CAPTURA
        // ------------------------------------------------------------------------
        superCapturaNextStep() {
            if (this.superCapturaStep === 1) {
                // validation
                if (!this.superCapturaForm.ID_Cliente) {
                    alert('Debes seleccionar o crear un cliente.');
                    return;
                }
                if (!this.superCapturaForm.Notas_Politicas) {
                    this.superCapturaForm.Notas_Politicas = this.DEFAULT_NOTAS;
                }
                this.superCapturaStep = 2;
            } else if (this.superCapturaStep === 2) {
                const exists = this.superCapturaForm.ID_Cotizacion && this.cotizaciones.some(c => c.ID_Cotizacion === this.superCapturaForm.ID_Cotizacion);
                if (!exists && this.superCapturaForm.Monto_Autorizado > 0) {
                    this.superCapturaCreateCotizacion();
                    return;
                }

                if (!this.superCapturaForm.ID_Cotizacion) {
                    alert('Debes seleccionar o crear una cotización.');
                    return;
                }
                // Pre-fill Devengado form values if empty
                if (!this.superCapturaForm.ID_Captura) {
                    this.superCapturaForm.ID_Captura = 'BIT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                }
                this.superCapturaStep = 3;
            } else if (this.superCapturaStep === 3) {
                if (this.superCapturaForm.Monto_Devengado <= 0) {
                    alert('El monto devengado debe ser mayor a cero.');
                    return;
                }
                this.superCapturaStep = 4;
            }
        },

        superCapturaPrevStep() {
            if (this.superCapturaStep > 1) {
                this.superCapturaStep--;
            }
        },

        onSuperCapturaClienteChange() {
            const client = this.clientes.find(c => c.ID_Cliente === this.superCapturaForm.ID_Cliente);
            if (client) {
                this.superCapturaForm.Nombre_Fiscal = client.Nombre_Fiscal || '';
                this.superCapturaForm.Nombre_Comercial = client.Nombre_Comercial || '';
                this.superCapturaForm.RFC = client.RFC || '';
                this.superCapturaForm.Direccion = client.Direccion || '';
                this.superCapturaForm.CP = client.CP || '';
            } else {
                this.superCapturaForm.Nombre_Fiscal = '';
                this.superCapturaForm.Nombre_Comercial = '';
                this.superCapturaForm.RFC = '';
                this.superCapturaForm.Direccion = '';
                this.superCapturaForm.CP = '';
            }
        },

        superCapturaCreateCliente() {
            if (!this.superCapturaForm.ID_Cliente || !this.superCapturaForm.Nombre_Fiscal) {
                alert('ID y Nombre Fiscal son obligatorios.');
                return;
            }
            const form = new FormData();
            form.append('ID_Cliente', this.superCapturaForm.ID_Cliente);
            form.append('Nombre_Fiscal', this.superCapturaForm.Nombre_Fiscal);
            form.append('Nombre_Comercial', this.superCapturaForm.Nombre_Comercial || this.superCapturaForm.Nombre_Fiscal);
            form.append('RFC', this.superCapturaForm.RFC || 'XAXX010101000');
            form.append('Direccion', this.superCapturaForm.Direccion || '');
            form.append('CP', this.superCapturaForm.CP || '');
            form.append('Estatus', 'Activo');

            fetch('/api/clientes', { method: 'POST', body: form })
            .then(res => res.json())
            .then(() => {
                this.loadAllData();
                alert('Cliente creado y seleccionado.');
                this.superCapturaStep = 2;
            });
        },

        uploadClientXML(event) {
            const file = (event.target && event.target.files) ? event.target.files[0] : (event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null);
            if (!file) return;

            const formData = new FormData();
            formData.append('xml_file', file);

            fetch('/api/admin/parse-client-xml', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error de lectura XML'); });
                }
                return res.json();
            })
            .then(data => {
                this.superCapturaForm.Nombre_Fiscal = data.Nombre;
                this.superCapturaForm.Nombre_Comercial = data.Nombre;
                this.superCapturaForm.RFC = data.RFC;
                this.superCapturaForm.CP = data.CodigoPostal || '';
                this.superCapturaForm.Direccion = data.Direccion || '';
                
                // Auto generate CLI ID if empty
                if (!this.superCapturaForm.ID_Cliente) {
                    this.superCapturaForm.ID_Cliente = 'CLI-' + data.RFC.slice(0, 4) + Math.floor(100 + Math.random() * 900);
                }
                alert('XML leído con éxito. Datos del cliente extraídos correctamente.');
            })
            .catch(err => {
                alert('Error al leer el XML de cliente: ' + err.message);
            });
        },

        superCapturaCreateCotizacion() {
            if (this.superCapturaForm.Monto_Autorizado <= 0) {
                alert('El Monto Autorizado es obligatorio y debe ser mayor a cero.');
                return;
            }

            const proceed = () => {
                const form = new FormData();
                if (this.superCapturaForm.ID_Cotizacion) {
                    form.append('ID_Cotizacion', this.superCapturaForm.ID_Cotizacion);
                }
                form.append('ID_Cliente', this.superCapturaForm.ID_Cliente);
                form.append('PO_Referencia', this.superCapturaForm.PO_Referencia || '');
                form.append('Monto_Autorizado', this.superCapturaForm.Monto_Autorizado);
                form.append('Piezas_Autorizadas', this.superCapturaForm.Piezas_Autorizadas || 0);
                form.append('Numero_Parte', this.superCapturaForm.Numero_Parte || '');
                
                let plantaName = this.superCapturaForm.Planta;
                const isNew = plantaName === 'NEW_PLANTA' || this.plantas.filter(pl => pl.ID_Cliente === this.superCapturaForm.ID_Cliente).length === 0;
                if (isNew) {
                    plantaName = this.superCapturaForm.Planta_Nueva;
                }
                form.append('Planta', plantaName || '');
                form.append('Notas_Politicas', this.superCapturaForm.Notas_Politicas || this.DEFAULT_NOTAS);
                form.append('Estatus', 'Aprobada');

                fetch('/api/cotizaciones', { method: 'POST', body: form })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => { throw new Error(err.message || 'Error al guardar cotización.'); });
                    }
                    return res.json();
                })
                .then(data => {
                    this.superCapturaForm.ID_Cotizacion = data.ID_Cotizacion;
                    this.loadAllData();
                    alert('Cotización creada y seleccionada. Folio asignado: ' + data.ID_Cotizacion);
                    this.superCapturaStep = 3;
                })
                .catch(err => {
                    alert('Error: ' + err.message);
                });
            };

            let plantaName = this.superCapturaForm.Planta;
            const isNew = plantaName === 'NEW_PLANTA' || this.plantas.filter(pl => pl.ID_Cliente === this.superCapturaForm.ID_Cliente).length === 0;
            if (isNew && this.superCapturaForm.Planta_Nueva) {
                const plantForm = new FormData();
                plantForm.append('ID_Cliente', this.superCapturaForm.ID_Cliente);
                plantForm.append('Nombre_Planta', this.superCapturaForm.Planta_Nueva);
                fetch('/api/plantas', { method: 'POST', body: plantForm })
                    .then(() => {
                        proceed();
                    });
            } else {
                proceed();
            }
        },

        superCapturaFinalize() {
            const form = new FormData();
            form.append('ID_Captura', this.superCapturaForm.ID_Captura);
            form.append('Fecha', this.superCapturaForm.Fecha);
            form.append('ID_Cotizacion', this.superCapturaForm.ID_Cotizacion);
            form.append('Horas_Trabajadas', this.superCapturaForm.Horas_Trabajadas);
            form.append('Piezas_Sorteadas', this.superCapturaForm.Piezas_Sorteadas);
            form.append('Monto_Devengado', this.superCapturaForm.Monto_Devengado);
            form.append('Estatus_Facturacion', 'Pendiente');

            fetch('/api/devengado', { method: 'POST', body: form })
            .then(res => res.json())
            .then(() => {
                const quoteIdToDownload = this.superCapturaForm.ID_Cotizacion;
                this.loadAllData();
                
                // Show PDF download modal
                this.postCaptureQuoteId = quoteIdToDownload;
                this.showModal = 'post_capture_pdf';

                // Reset form
                this.superCapturaForm = {
                    ID_Cliente: '', Nombre_Fiscal: '', Nombre_Comercial: '', RFC: '', Direccion: '', CP: '',
                    ID_Cotizacion: '', PO_Referencia: '', Monto_Autorizado: 0, Piezas_Autorizadas: 0,
                    ID_Captura: '', Fecha: new Date().toISOString().split('T')[0], Horas_Trabajadas: 0, Piezas_Sorteadas: 0, Monto_Devengado: 0,
                    Planta: '', Planta_Nueva: '', Numero_Parte: '', Notas_Politicas: ''
                };
                this.superCapturaStep = 1;
            });
        },

        generateNextQuoteFolio() {
            const numericIds = this.cotizaciones
                .map(c => c.ID_Cotizacion)
                .filter(id => id && id.startsWith('COT-'))
                .map(id => parseInt(id.replace('COT-', ''), 10))
                .filter(num => !isNaN(num));
            const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 0;
            return 'COT-' + String(maxNum + 1).padStart(4, '0');
        },

        exportQuoteToPDF(cot, lang = null) {
            if (lang) {
                this.pdfLang = lang;
            }
            this.selectedQuoteForPDF = cot;
            const client = this.clientes.find(c => c.ID_Cliente === cot.ID_Cliente);
            this.selectedQuoteForPDFClient = client || { Nombre_Fiscal: 'Cliente Desconocido', RFC: '', Direccion: '', CP: '' };
            
            this.$nextTick(() => {
                const element = document.getElementById('quote-pdf-template');
                if (!element) return;
                
                const prefix = this.pdfLang === 'en' ? 'Quote' : 'Cotizacion';
                const opt = {
                    margin:       10,
                    filename:     `${prefix}_${cot.ID_Cotizacion}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
                };
                
                html2pdf().from(element).set(opt).save();
            });
        },

        updateQuoteStatus(cotId, newStatus) {
            const form = new FormData();
            form.append('Estatus', newStatus);
            fetch(`/api/cotizaciones/update/${cotId}`, { method: 'POST', body: form })
                .then(res => res.json())
                .then(() => {
                    this.loadAllData();
                });
        },

        uploadQuoteEvidenceFile(event, cotId) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('foto', file);

            fetch('/api/cotizaciones/upload', { method: 'POST', body: formData })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => { throw new Error(err.message || 'Error del servidor al subir evidencia.'); });
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.status === 'success' && data.path) {
                        const updateForm = new FormData();
                        updateForm.append('Evidencia', data.path);
                        return fetch(`/api/cotizaciones/update/${cotId}`, { method: 'POST', body: updateForm })
                            .then(res => {
                                if (!res.ok) {
                                    return res.json().then(err => { throw new Error(err.message || 'Error al vincular evidencia a la cotización.'); });
                                }
                                return res.json();
                            })
                            .then(() => {
                                this.loadAllData();
                                alert('✅ Evidencia de aprobación cargada y vinculada con éxito.');
                            });
                    } else {
                        throw new Error(data.message || 'No se recibió la ruta del archivo.');
                    }
                })
                .catch(err => {
                    alert('⚠️ Error al adjuntar evidencia: ' + err.message);
                });
        },

        uploadQuoteInvoiceXML(event, cotId) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('xml_file', file);
            formData.append('ID_Cotizacion', cotId);

            fetch('/api/facturas/upload-xml', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        this.loadAllData();
                        alert('Factura XML cargada. La cotización se ha movido automáticamente a Por Cobrar.');
                    } else {
                        alert('Error al vincular XML de Factura: ' + (data.messages?.error || data.message || 'Error desconocido'));
                    }
                })
                .catch(err => {
                    alert('Error en la petición: ' + err);
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
                this.clientForm = { ID_Cliente: '', Nombre_Fiscal: '', Nombre_Comercial: '', RFC: '', Estatus: 'Activo', Direccion: '', CP: '' };
            } else if (type === 'cotizacion') {
                const nextFolio = this.generateNextQuoteFolio();
                this.cotizacionForm = { 
                    ID_Cotizacion: nextFolio, 
                    ID_Cliente: '', 
                    PO_Referencia: '', 
                    Monto_Autorizado: 0, 
                    Piezas_Autorizadas: 0, 
                    Estatus: 'Pendiente', 
                    Evidencia: '', 
                    Numero_Parte: '', 
                    Planta: '', 
                    Notas_Politicas: this.DEFAULT_NOTAS,
                    Numero_Remision: ''
                };
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

        seedDatabase() {
            if (!confirm('¿Estás seguro de sembrar datos de prueba? Esto reiniciará la base de datos con registros demo.')) return;
            fetch('/api/admin/seed-database', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                alert(data.message || 'Datos de prueba sembrados.');
                this.loadAllData();
            })
            .catch(err => alert('Error al sembrar: ' + err.message));
        },

        clearDatabase() {
            if (!confirm('¿Estás seguro de borrar todos los datos? Esto vaciará todas las tablas (Clientes, Cotizaciones, Sorteos, Facturas, Pagos).')) return;
            fetch('/api/admin/clear-database-zero', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                alert(data.message || 'Base de datos borrada a cero.');
                this.loadAllData();
            })
            .catch(err => alert('Error al borrar: ' + err.message));
        },

        saveItem(type) {
            let url = `/api/${type === 'devengado' ? 'devengado' : type === 'pago' ? 'pagos' : type === 'cotizacion' ? 'cotizaciones' : type + 's'}`;
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
            
            let url = `/api/${type === 'devengado' ? 'devengado' : type === 'pago' ? 'pagos' : type === 'cotizacion' ? 'cotizaciones' : type + 's'}/delete/${encodeURIComponent(id)}`;
            
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
        // ACCIONES MASIVAS: FACTURAS
        // ------------------------------------------------------------------------
        toggleSelectAllFacturas() {
            const filtered = this.getFilteredFacturas();
            if (this.isAllFacturasSelected()) {
                this.selectedFacturas = [];
            } else {
                this.selectedFacturas = filtered.map(f => f.Folio_Factura);
            }
        },

        isAllFacturasSelected() {
            const filtered = this.getFilteredFacturas();
            if (!filtered || filtered.length === 0) return false;
            return filtered.every(f => this.selectedFacturas.includes(f.Folio_Factura));
        },

        deleteSelectedFacturas() {
            if (this.selectedFacturas.length === 0) return;
            const count = this.selectedFacturas.length;
            if (!confirm(`¿Estás seguro de que deseas eliminar las ${count} facturas seleccionadas? Esta acción aplicará borrado lógico.`)) {
                return;
            }

            fetch('/api/facturas/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folios: this.selectedFacturas })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || `Se procesó la eliminación de las facturas.`);
                this.selectedFacturas = [];
                this.loadAllData();
            })
            .catch(err => {
                alert('Error al eliminar facturas masivamente: ' + err.message);
            });
        },

        applyBulkStatus() {
            if (this.selectedFacturas.length === 0) return;
            if (!this.bulkStatusValue) return;

            fetch('/api/facturas/batch-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folios: this.selectedFacturas,
                    estatus: this.bulkStatusValue
                })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || `Se actualizó el estatus de las facturas.`);
                this.showBulkStatusModal = false;
                this.selectedFacturas = [];
                this.loadAllData();
            })
            .catch(err => {
                alert('Error al actualizar estatus masivamente: ' + err.message);
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
            const files = (event && event.target && event.target.files) ? Array.from(event.target.files) : null;
            if (files && files.length > 0) {
                this.tempXmlFiles = files;
            }
            if (!this.tempXmlFiles || this.tempXmlFiles.length === 0) return;

            this.xmlStatus = 'Procesando complementos XML de conciliación...';
            this.reconciliationLogs = [];
            const formData = new FormData();
            this.tempXmlFiles.forEach(file => {
                formData.append('xml_file[]', file);
            });
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
                this.tempXmlFiles = []; // Reset files
            })
            .catch(err => {
                this.xmlStatus = 'Error de validación: ' + err.message;
            });
        },

        uploadQuoteEvidencia(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('foto', file);

            fetch('/api/cotizaciones/upload', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error de subida'); });
                }
                return res.json();
            })
            .then(data => {
                this.cotizacionForm.Evidencia = data.path;
                alert('Foto de evidencia cargada exitosamente.');
            })
            .catch(err => {
                alert('Error al subir imagen: ' + err.message);
            });
        },

        loadDashboard() {
            let url = '/api/dashboard/resumen';
            const params = [];
            if (this.filters.dashboard.start) {
                params.push('fecha_inicio=' + encodeURIComponent(this.filters.dashboard.start));
            }
            if (this.filters.dashboard.end) {
                params.push('fecha_fin=' + encodeURIComponent(this.filters.dashboard.end));
            }
            if (this.filters.dashboard.cliente) {
                params.push('id_cliente=' + encodeURIComponent(this.filters.dashboard.cliente));
            }
            if (params.length > 0) {
                url += '?' + params.join('&');
            }
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    this.dashboardData = data;
                })
                .catch(err => {
                    console.error('Error al cargar dashboard:', err);
                });
        },

        resetDashboardFilters() {
            this.filters.dashboard = { start: '', end: '', cliente: '' };
            this.loadDashboard();
        },

        loadExecutiveReport() {
            let url = '/api/reportes/resumen';
            const params = [];
            if (this.filters.reportes.start) {
                params.push('fecha_inicio=' + encodeURIComponent(this.filters.reportes.start));
            }
            if (this.filters.reportes.end) {
                params.push('fecha_fin=' + encodeURIComponent(this.filters.reportes.end));
            }
            if (this.filters.reportes.cliente) {
                params.push('id_cliente=' + encodeURIComponent(this.filters.reportes.cliente));
            }
            if (params.length > 0) {
                url += '?' + params.join('&');
            }
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    this.reportData = data;
                })
                .catch(err => {
                    console.error('Error al cargar reporte ejecutivo:', err);
                });
        },

        resetReportFilters() {
            this.filters.reportes = { start: '', end: '', cliente: '' };
            this.loadExecutiveReport();
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
                reportes: 'Reportes de Cobranza',
                super_captura: 'Modo Super Captura Wizard',
                logs: 'Bitácora de Eventos y Logs del Sistema'
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

        formatQuoteAmount(value, currency) {
            if (!currency || currency === 'null' || currency === 'N/A') {
                const num = parseFloat(value) || 0;
                return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            if (currency === 'USD' || currency === 'Dolar americano') {
                return this.formatUSD(value || 0);
            }
            return this.formatCurrency(value || 0);
        },

        getParetoData() {
            // Filter out fully paid invoices, group and sum overdue/vigente debt per client
            const debtByClient = {};
            this.facturasData.filter(f => f.Estatus_Pago !== 'Pagada').forEach(f => {
                const cli = f.Cliente;
                const amt = parseFloat(f.Monto_Total);
                debtByClient[cli] = (debtByClient[cli] || 0) + amt;
            });

            // Map and sort descending
            const sortedDebt = Object.keys(debtByClient).map(cli => ({
                cliente: cli,
                deuda: debtByClient[cli]
            })).sort((a, b) => b.deuda - a.deuda);

            const totalDebt = sortedDebt.reduce((sum, item) => sum + item.deuda, 0);

            // Compute cumulative percentage
            let acc = 0;
            return sortedDebt.map(item => {
                acc += item.deuda;
                const pct = (acc / totalDebt) * 100;
                return {
                    ...item,
                    acumulado_pct: pct.toFixed(1)
                };
            });
        },

        // ------------------------------------------------------------------------
        // FILTERED LIST GETTERS
        // ------------------------------------------------------------------------
        getFilteredClientes() {
            return this.clientes.filter(c => {
                const matchSearch = !this.filters.clientes.search || 
                    c.Nombre_Comercial.toLowerCase().includes(this.filters.clientes.search.toLowerCase()) ||
                    c.Nombre_Fiscal.toLowerCase().includes(this.filters.clientes.search.toLowerCase()) ||
                    c.ID_Cliente.toLowerCase().includes(this.filters.clientes.search.toLowerCase()) ||
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
            return this.cotizaciones.filter(cot => {
                const isBilled = this.facturasData.some(fac => fac.ID_Cotizacion === cot.ID_Cotizacion);
                if (isBilled) return false;

                const matchSearch = !this.filters.porfacturar.search ||
                    cot.ID_Cotizacion.toLowerCase().includes(this.filters.porfacturar.search.toLowerCase()) ||
                    cot.Cliente.toLowerCase().includes(this.filters.porfacturar.search.toLowerCase());
                const matchCliente = !this.filters.porfacturar.cliente || cot.ID_Cliente === this.filters.porfacturar.cliente;
                return matchSearch && matchCliente;
            });
        },

        getFilteredPorCobrar() {
            return this.facturasData.filter(f => f.Estatus_Pago !== 'Pagada').filter(item => {
                const matchSearch = !this.filters.porcobrar.search ||
                    item.Folio_Factura.toLowerCase().includes(this.filters.porcobrar.search.toLowerCase()) ||
                    item.Cliente.toLowerCase().includes(this.filters.porcobrar.search.toLowerCase());
                const matchCliente = !this.filters.porcobrar.cliente || item.ID_Cliente === this.filters.porcobrar.cliente;
                const matchStart = !this.filters.porcobrar.start || item.Fecha_Emision >= this.filters.porcobrar.start;
                const matchEnd = !this.filters.porcobrar.end || item.Fecha_Emision <= this.filters.porcobrar.end;
                return matchSearch && matchCliente && matchStart && matchEnd;
            });
        },

        // ------------------------------------------------------------------------
        // LOGGING & AUDITORÍA (PERFIL ADMIN)
        // ------------------------------------------------------------------------
        loadAuditLogs() {
            this.logsData.loading = true;
            this.logsData.error = '';
            let url = `/api/admin/logs/audit?limit=300`;
            if (this.filters.logs.modulo) {
                url += `&modulo=${encodeURIComponent(this.filters.logs.modulo)}`;
            }
            if (this.filters.logs.search) {
                url += `&search=${encodeURIComponent(this.filters.logs.search)}`;
            }

            fetch(url, {
                headers: {
                    'X-User-Email': this.userEmail
                }
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error al consultar bitácora.'); });
                }
                return res.json();
            })
            .then(data => {
                this.logsData.audit = data.data || [];
                this.logsData.loading = false;
            })
            .catch(err => {
                this.logsData.error = err.message;
                this.logsData.loading = false;
            });
        },

        loadSystemLogs(filename = '') {
            this.logsData.loading = true;
            let url = `/api/admin/logs/system`;
            if (filename) {
                url += `?file=${encodeURIComponent(filename)}`;
            }

            fetch(url, {
                headers: {
                    'X-User-Email': this.userEmail
                }
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Error al consultar logs del servidor.'); });
                }
                return res.json();
            })
            .then(data => {
                this.logsData.systemFiles = data.files || [];
                this.logsData.selectedFile = data.selectedFile || '';
                this.logsData.systemContent = data.content || '';
                this.logsData.loading = false;
            })
            .catch(err => {
                this.logsData.error = err.message;
                this.logsData.loading = false;
            });
        },

        getFilteredAuditLogs() {
            let logs = this.logsData.audit || [];
            const search = (this.filters.logs.search || '').toLowerCase();
            const modulo = this.filters.logs.modulo;

            return logs.filter(l => {
                const matchModulo = !modulo || l.modulo === modulo;
                const matchSearch = !search ||
                    (l.descripcion && l.descripcion.toLowerCase().includes(search)) ||
                    (l.usuario_email && l.usuario_email.toLowerCase().includes(search)) ||
                    (l.accion && l.accion.toLowerCase().includes(search)) ||
                    (l.modulo && l.modulo.toLowerCase().includes(search));
                return matchModulo && matchSearch;
            });
        },

        inspectLogJson(logItem) {
            this.logsData.inspectingLog = logItem;
        },

        closeInspectLog() {
            this.logsData.inspectingLog = null;
        }
    }));
});
