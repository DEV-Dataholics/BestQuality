jul 7, 2026

## **BQS \- Transcripción**

### **00:00:00**

**Gustavo Ruiz (Dataholics):** Hm hm. Muy bien. Luego grabar grabación. ¿Entendido? Listo, estamos grabando. Muy bien. Como te decía, ahorita la intención pues va a ser este perfilar un poco ya el los documentos en como en virtud un poco de entenderlos para la lógica que ya tenemos del demo que estamos preparando. Entonces,

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** en este demo lo que voy a buscar hacer es básicamente, se quedó como atorado esto. Sí, me puedes ver. Se activó el VPN. Voy a ver aquí la parte de la documentación que me interesa revisar contigo es esta

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** y facturo. Okay, voy a partir. A mí normalmente se me hace más sencillo haciéndole como de atrás para adelante, ¿no? Eh, yéndonos como al revés. En este documento que tenemos nosotros aquí en el en el sistema que es el de el de Eric, básicamente lo que entiendo aquí es de que este es este es el resumen.

### **00:01:19**

**Gustavo Ruiz (Dataholics):** Esto de aquí por lo mismo no me deja ver esto. Este resumen de acá, miren, este resumen es el target del reporte de del sistema, que ese es el que estoy planteando yo, que sea como el eje del del trabajo, el que tenemos aquí como como reporte. Resumen, reporte, me parece se resumen. Bien, lo primero que me gustaría sería de que pudiéramos empezar a partir de aquí hacia atrás para entender el flujo del

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** efectivo, cómo es que cómo es que camina por tus como por tu documento para entender yo de qué forma podemos programar la regla de negocio. Acá ya tengo los inputs, ya tengo un poco los campos, el tema de las tablas, me falta nada más entender o tratar de amarrar como el tema de la lógica de negocio. Entonces,

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** esto hacia atrás tenemos, yo lo voy a ir platicando un poco como yo lo tengo aquí este entendido, es de que este resumen le permite ver a él eh por una parte lo que está este digamos que en pesos y por otra parte lo que está en dólares y luego de la parte izquierda son todos los clientes específicamente que

### **00:02:18**

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** cobran en pesos y la derecha los que cobran específicamente en dólares. Eso eso es correcto.

**nomina bqs:** sí, correcto.

**Gustavo Ruiz (Dataholics):** Muy bien. Entonces esta de esta información hacia atrás tú tienes lo facturado versus lo pagado. En este caso, las fórmulas me envían hacia atrás que este es el facturación J9. Entonces, este facturado lo tienes ligado a facturación en México y

**nomina bqs:** Ajá.

**Gustavo Ruiz (Dataholics):** este de aquí lo vas a ligar tú eh a cuál cuál es el campo que estás contemplando para este

**nomina bqs:** E creo que es la primera. Es para donde dice total MXN.

**Gustavo Ruiz (Dataholics):** XL es el J9, ¿verdad? J9.

**nomina bqs:** Es

**Gustavo Ruiz (Dataholics):** Este pues ya es la suma de los dos. Okay. Entonces, el total uh viene directamente del folio, o sea, esto es el equivalente, digamos que esto es una factura directamente, ¿no? Entonces, esta factura se emitió el día fulano de tal.

### **00:03:18**

**nomina bqs:** exactamente,

**Gustavo Ruiz (Dataholics):** Este folio eh, ¿es un folio interno que tú tienes o es un folio?

**nomina bqs:** no es el que me genera el pack con el que facturo. Eh,

**Gustavo Ruiz (Dataholics):** Ah, okay.

**nomina bqs:** se llama

**Gustavo Ruiz (Dataholics):** Es un dato que tú puedes que tú ingresas manualmente. Okay. RFC,

**nomina bqs:** así.

**Gustavo Ruiz (Dataholics):** receptor, eh, subtotal, impuesto. El impuesto que, ¿cómo lo calculas tú aquí?

**nomina bqs:** Eh,

**Gustavo Ruiz (Dataholics):** Es el 10\.

**nomina bqs:** depende de la empresa, llámese al 8 o al 16\.

**Gustavo Ruiz (Dataholics):** Okay. Va a depender de qué tipo de empresa es el a la que le estás

**nomina bqs:** Sí, ellos ya me avisan,

**Gustavo Ruiz (Dataholics):** facturando.

**nomina bqs:** ya sea en la PO o en el mismo correo, me dicen a qué IVA le voy a facturar.

**Gustavo Ruiz (Dataholics):** Okay. Esto varía normalmente entre pedidos. Por ejemplo, un mismo cliente puede hacerte pedidos con diferente porcentaje de IVA.

### **00:04:06**

**Gustavo Ruiz (Dataholics):** O sea,

**nomina bqs:** No,

**Gustavo Ruiz (Dataholics):** es es como digamos como un valor asignado por cliente. O sea, un cliente te dice, "Yo al 8,

**nomina bqs:** sí.

**Gustavo Ruiz (Dataholics):** yo al 16\.

**nomina bqs:** Sí, casi siempre toda la maquila que tiene alguna base aquí me la pid al ocho. Si es un foráneo dentro del nivel nacional me pid el 16\.

**Gustavo Ruiz (Dataholics):** entiendo. Entonces, tú eso ya lo tienes bancado en un en un espacio donde tú ya conoces y dices, "Bueno, estos son los clientes y este es como el el tipo de facturación que llevan ellos. Es en en pesos y es este al 16%,

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** digamos. Esta información tú la guardas en un lugar específico, eh, o sea, como tú tienes como un, digamos, como un directorio de clientes donde tienes toda tu información o lo tienes como en archivos.

**nomina bqs:** No, de hecho nada más así como en el correo como me lo van mandando, te digo, o en la PO misma a veces me ponen a qué tipo de IVA voy a ponerles.

### **00:04:57**

**Gustavo Ruiz (Dataholics):** Perfecto. Entonces, este, lo que podríamos hacer es uno de estos resúmenes, perdón, no es cierto. Hm. Digamos que en un mes de servicios tú podrías capturar el total de los clientes a los que les facturas tú en un ciclo. O sea, yo yo con un mes de, digamos, si yo si yo reviso todo marzo de 2026, yo puedo extraer eh la información de todos los clientes porque tú en ese mes facturaste a todos, o sea, o me faltarían como hay alguno que facture en ciclos de dos meses o así.

**nomina bqs:** No, de hecho tratamos de facturarles cada 15 días, entonces en un mes eh sí van a estar casi todos prácticamente.

**Gustavo Ruiz (Dataholics):** Ah, okay. Me me gustaría saber si podemos este también en lo que seguimos platicando eh llegar en el acuerdo de que me puedas

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** enviar un mes específico, el que tú quieras, lo que lo que sobre todo pues yo creo que el más reciente,

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** ¿no? para que al final lo que queremos nosotros es eh identificar, o sea, yo lo que quiero es hacerte la chamba de una vez de de armarte como un directorio de clientes para dejarle ya cargado el el como el RFC,

### **00:05:59**

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** el receptor y toda esa onda para que lo podamos como ir trabajando en ese sentido en la base de datos y que ya esa información ya viva en un solo lugar, ya en caso de algo que ya puedas tú consultarla rápido. Eso independientemente de lo que haga el MVP, ¿no?

**nomina bqs:** Ah,

**Gustavo Ruiz (Dataholics):** Esto es como para que tú lo

**nomina bqs:** okay. Entonces, te pongo lo que sería RFC,

**Gustavo Ruiz (Dataholics):** tengas

**nomina bqs:** el nombre, el IVAL que se factura y ¿qué

**Gustavo Ruiz (Dataholics):** correcto.

**nomina bqs:** más?

**Gustavo Ruiz (Dataholics):** ¿Qué otra cosa necesitarías tú como como personalizar por cada cliente? Por ejemplo, eh, mira, aquí es lo que estoy viendo son fecha de pago, monto de pago. Ah, okay. Por ejemplo, eh, las números de parte es que eso yo me imagino que ha de ser s super amplio, ¿no? O sea, ellos o o es como ya tienen algunas partes predeterminadas. Por ejemplo, a este cliente, el Aduxi Group, este, tienes tú como un catálogo de las partes que le toca, o sea, con las que trabajas con él.

### **00:06:55**

**nomina bqs:** Las puedo sacar de las mismas cotizaciones. Hm. Casi todos llevan el mismo número. Probablemente hay algunos en Stratec que si son amplios, pero los hacemos

**Gustavo Ruiz (Dataholics):** Sí, igual lo que estoy buscando yo un poco es tratar como de ahorrarte tiempos más bien,

**nomina bqs:** continuamente.

**Gustavo Ruiz (Dataholics):** o sea, lo que lo que quiero yo es cómo hacemos para que toda esta información esté, digo, la que normalmente viviría una sola ocasión, como son estos datos permanentes, ya la tengamos previamente cargada. Si quieres vamos a concentrarnos en eso. ¿Qué datos de los clientes son los que casi no cambian? Por ejemplo, ¿fe fechas de pago cambian en función de la factura o siempre hay una fecha de pago para ese cliente?

**nomina bqs:** Eh, si cambian porque ellos tienen sus propios términos. Aunque nosotros les digamos a 30 días, ellos como las maquilas son a 60 o a 90 días.

**Gustavo Ruiz (Dataholics):** Okay. Entonces, pero entonces sí va a depender si eso sería como uno fijo. Okay. Entonces,

### **00:07:52**

**nomina bqs:** Mm.

**Gustavo Ruiz (Dataholics):** ese también si quieres lo incluimos. Eh,

**nomina bqs:** Y igual puedo poner ahí si se requiere PO o no.

**Gustavo Ruiz (Dataholics):** por ejemplo, ¿qué es Pum? ¿Me puedes explicar?

**nomina bqs:** La orden de compra.

**Gustavo Ruiz (Dataholics):** Ah, produc

**nomina bqs:** Hay muchos que requieren que en su factura lleven el número de orden de compra de

**Gustavo Ruiz (Dataholics):** order.

**nomina bqs:** ellos para poderlo relacionar como

**Gustavo Ruiz (Dataholics):** Okay,

**nomina bqs:** rápido.

**Gustavo Ruiz (Dataholics):** okay, okay. Sí, perfecto. El CFDI, el ese es el de la factura, ¿no? Directamente.

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** Okay. En la factura. Dame un dame un segundito, eh, hijo. Sí, disculpas, es que ya sabes,

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** estoy en home office. Eh, eh, se me fue el patín.

### **00:08:46**

**Gustavo Ruiz (Dataholics):** Ya estaba hablando el CFDI, este esta factura tú toda esa información la tomas directamente de las facturas que les

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** emites.

**nomina bqs:** en el mismo sistema en el que facturo me genera un reporte. Yo le pongo de qué fecha, qué fecha y me genera un reporte. Entonces,

**Gustavo Ruiz (Dataholics):** Sí.

**nomina bqs:** nada más copio y pego de uno al

**Gustavo Ruiz (Dataholics):** Ah, perfecto. Entonces, ya tenemos el reporteador que genera como la información de la Sí,

**nomina bqs:** otro.

**Gustavo Ruiz (Dataholics):** te voy a decir como para agregarlo, pero pues ya lo tienes el reporte. Okay. Ese reporte lo copias y lo pegas. Este, a ese reporte le quitas cosas antes de

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** pegarlo.

**nomina bqs:** aquí sí,

**Gustavo Ruiz (Dataholics):** Okay,

**nomina bqs:** como le quito, por ejemplo,

**Gustavo Ruiz (Dataholics):** fíjate.

**nomina bqs:** si es el que si es en efectivo, el tipo de moneda, eso se lo quitan. Son ciertas columnas.

### **00:09:30**

**Gustavo Ruiz (Dataholics):** Okay. Te voy a decir, te voy a pedir un favorzote. Fíjate, aquí lo que podemos hacer es esto. Como tú ya tienes un input para esa información,

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** para trabajarla y y capturarla acá, lo que puedo hacer es facilitarte la carga. O sea, es decir, si si tú me das un ejemplo de cómo te de cómo te exporta ese documento tu sistema,

**nomina bqs:** Hm.

**Gustavo Ruiz (Dataholics):** yo puedo crear que el sistema tuyo, el propio, eh cargue archivos iguales a los que tú tienes. O sea, si no cambia el el formato, podemos hacer que los lea este inmediatamente. ¿Qué tipo de archivo es el que te arroja tu sistema?

**nomina bqs:** me arroja un Excel X.

**Gustavo Ruiz (Dataholics):** ¿Es un XLS o es un CSB?

**nomina bqs:** A ver, déjame ver qué qué

**Gustavo Ruiz (Dataholics):** Sí, chécate. Igual digo, creo que puedo procesar ambos,

**nomina bqs:** termina.

**Gustavo Ruiz (Dataholics):** eh, pero déjame revisar.

### **00:10:22**

**nomina bqs:** Ah. Bueno, es que me lo abre como Excel, pero si no mal recuerdo está

**Gustavo Ruiz (Dataholics):** Puedes darle clic derecho al al archivo en el en la carpeta.

**nomina bqs:** CSB.

**Gustavo Ruiz (Dataholics):** SSB. ¡Uf\! Está fabuloso. Eso eso nos facilita mucho la vida.

**nomina bqs:** CSB.

**Gustavo Ruiz (Dataholics):** Entonces, ahí te va. vas a mandarme el archivo tal cual como te lo exporta para si quieres mándamelo por por WhatsApp ahí mismo para

**nomina bqs:** Ajá.

**Gustavo Ruiz (Dataholics):** tenerlo. Este, yo aquí me encargo de cargarlo en en el en el en la folder,

**nomina bqs:** Okay.

**Gustavo Ruiz (Dataholics):** eh, y me vas a decir en un listado así muy sencillo, si tienes así nada más escrito directamente qué columnas te interesan para entonces

**nomina bqs:** Ajá. Ok.

**Gustavo Ruiz (Dataholics):** básicamente lo que haría sería exportarlo de tu del otro sistema y subirlo al de acá. Eso ya te te ahorraría, por ejemplo, el tiempo de captura en tu sistema específico.

### **00:11:09**

**Gustavo Ruiz (Dataholics):** Entonces, a partir de ahí ya podemos eh cargar la información para generarte este reporte de aquí, porque básicamente lo que haces es jalar esa información que es la que luego se traduce en este que estamos acá. Déjame. Ah,

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** ya sé por qué se me está apagando.

**nomina bqs:** nada más es como para que la entienda más rápido.

**Gustavo Ruiz (Dataholics):** Sí, déjame conecto mi cargador porque ya sé por qué se estaba apagando esta

**nomina bqs:** Ok.

**Gustavo Ruiz (Dataholics):** cosa. Muy bien. Excelente. Eh, acá porque estoy esperando a que me avisen de algo. Eh, entonces el básicamente lo que haría pues es es a partir de ese es donde tú tomas esto de acá, ¿no?, que es donde haces ya como los concentrados de esto por cada uno.

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** Entonces, lo que va a hacer el sistema es hacerte esta tabla automáticamente por lo pronto.

**nomina bqs:** sí.

**Gustavo Ruiz (Dataholics):** Así vamos a Ya, ya, ya identifiqué cómo podemos comernos ese tiempo. De tal forma que si tú me ese tú exportas primero los que son en pesos y luego los que son en dólares y luego ya los capturas o exportas uno solo y luego de ahí los los divides.

### **00:12:27**

**nomina bqs:** el sistema de los datos,

**Gustavo Ruiz (Dataholics):** ¿Cómo haces la Ah, okay.

**nomina bqs:** el el Sí,

**Gustavo Ruiz (Dataholics):** ¿Cómo haces el cambio de divisa?

**nomina bqs:** el propio reporte que te acabo de mandar ahí me lo manda generales,

**Gustavo Ruiz (Dataholics):** Sí.

**nomina bqs:** o sea, me nos acomoda así por el número de folio. Entonces, lo que yo hago nada más es ordenarlos por nombre del cliente y ya me voy cambiando de pestaña según lo que voy a tener que poner.

**Gustavo Ruiz (Dataholics):** Ah, okay, okay. Estoy terminando de abrir el archivo. Déjame para poderlo revisarlo. que lo lo abro acá en en esta cosa de este lado, pero a ver cómo batall para que abran los exces de aquí. Tengo continuar gratis. Ahora sí podemos regresar los tres pasos para atrás. A partir de aquí dices que que tú eliminas eh, perdón, el tema del cambio, el tipo de

**nomina bqs:** Eh,

**Gustavo Ruiz (Dataholics):** cambio.

**nomina bqs:** si cambio, por ejemplo, las columnas, si te fijas, están en otro orden diferente al que lo tengo.

### **00:13:45**

**Gustavo Ruiz (Dataholics):** Sí,

**nomina bqs:** y quito, por ejemplo,

**Gustavo Ruiz (Dataholics):** correcto.

**nomina bqs:** el método de pago, forma de definir. Hay unos retenciones de impuesto que también se las quito porque no las manejamos

**Gustavo Ruiz (Dataholics):** Igual lo que voy a hacer es que cargue todo y ya nada más lo que vamos a hacer es de que borrarlo,

**nomina bqs:** y

**Gustavo Ruiz (Dataholics):** o sea, como ocultar lo que no ocupes y así si eventualmente en algún punto,

**nomina bqs:** ajá.

**Gustavo Ruiz (Dataholics):** ¿sabes cómo? Pues lo activamos y ya no tenemos que construir sobre eso.

**nomina bqs:** Ah, okay.

**Gustavo Ruiz (Dataholics):** Sí. O sea, voy a incluir todo y te va a dar la oportunidad de que tú quites lo que

**nomina bqs:** Y porque si te fijas Ah,

**Gustavo Ruiz (Dataholics):** necesitas.

**nomina bqs:** okay. Una pregunta. En este archivo que te mandé ahí me manda los XML de los complementos de pago, que se supone va ligada a la factura que me están pagando y trae la información del día del pago.

**Gustavo Ruiz (Dataholics):** Okay. Tú lo que haces,

### **00:14:32**

**nomina bqs:** Eso también se va a poder agregar.

**Gustavo Ruiz (Dataholics):** Sí, tú lo que haces aquí es ver la fecha y luego los los juntas.

**nomina bqs:** Eh, sí, haz de cuenta que me mandan, no sé, la transferencia, entonces yo genero como si fuera una factura, pero es el pago. Les tengo que poner qué día me pagaron al folio números de cuenta y va ligado a la factura. Tengo que incluirla.

**Gustavo Ruiz (Dataholics):** Tienes ese reporte a la a la mano para para verlo,

**nomina bqs:** ¿Cómo reporte?

**Gustavo Ruiz (Dataholics):** perdón.

**nomina bqs:** ¿Cómo un reporte? Es el que te acabo de mandar ahí. Los que dicen pago.

**Gustavo Ruiz (Dataholics):** Ah, esto de aquí. Ah, caray. Perdón. Entonces,

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** quiere decir que sí me confundí completamente. Voy a regresar tres pasos para atrás. Una disculpa. Nada más como para reprocesarlo. Okay. Esto que estoy señalando aquí,

### **00:15:20**

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** que son los complementos, estos de aquí, ¿qué haces tú con ellos?

**nomina bqs:** Los que dicen complemento de pago son las fechas que yo le tengo en la en las columnas que dicen pago.

**Gustavo Ruiz (Dataholics):** Sí.

**nomina bqs:** Nada más le pongo la fecha y jalo el cuánto me pagaron.

**Gustavo Ruiz (Dataholics):** A ver, espérame,

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** espér la columna que es de pago, más no la veo.

**nomina bqs:** En la de facturación MX, por ejemplo,

**Gustavo Ruiz (Dataholics):** Facturación. ¿Dónde está eso? A ver, ¿estás viendo mi te estoy compartiendo mi pantalla?

**nomina bqs:** en el archivo que est la pantalla,

**Gustavo Ruiz (Dataholics):** Creo que no, ¿verdad?

**nomina bqs:** ¿no? Nada más se ve el archivo que está de

**Gustavo Ruiz (Dataholics):** Ay, con razón. Pues eso sí, por supuesto. Es que discúlpame,

**nomina bqs:** colores.

**Gustavo Ruiz (Dataholics):** eh, error de Vamos a vamos a dejar de compartir y luego voy a compartirte la que sigues, que es esta de aquí y me voy a ir a este de acá.

### **00:16:12**

**Gustavo Ruiz (Dataholics):** CSD. Este es el Este es el que estoy viendo yo. Este es correcto,

**nomina bqs:** Ah, sí, esos complementos de pago.

**Gustavo Ruiz (Dataholics):** ¿no?

**nomina bqs:** Yo tengo que tomar la información de la transferencia y agregarle a qué factura

**Gustavo Ruiz (Dataholics):** ¿Cuál es cuál es la información

**nomina bqs:** es en el XML

**Gustavo Ruiz (Dataholics):** del Ah,

**nomina bqs:** viene. O sea,

**Gustavo Ruiz (Dataholics):** okay. Entonces tú.

**nomina bqs:** aquí lo refleja como complemento de pago y me dice qué cliente es,

**Gustavo Ruiz (Dataholics):** Ah, okay.

**nomina bqs:** pero en el XML ya me viene qué factura es la que están pagando aquí.

**Gustavo Ruiz (Dataholics):** Ah, okay. Entonces, en el sistema tú estos de aquí los tienes que cotejar con los XML porque no tienes la información en el sistema. O sea,

**nomina bqs:** Aquí no.

**Gustavo Ruiz (Dataholics):** esto de aquí,

**nomina bqs:** Ajá. O sea,

**Gustavo Ruiz (Dataholics):** todos los que

**nomina bqs:** el reporte, el este reporte que me da aquí nada más me viene como complemento de pago.

### **00:16:55**

**Gustavo Ruiz (Dataholics):** aparecen

**nomina bqs:** Pero si yo quiero ver qué factura me pagaron, tengo que irme o a abrir otra vez el archivo o abrir el XML.

**Gustavo Ruiz (Dataholics):** eh cuál otro archivo es el que tienes que abrir?

**nomina bqs:** Eh, en sí lo que acabo de facturar.

**Gustavo Ruiz (Dataholics):** Ah, okay. Entonces, básicamente si tú quieres la única forma de poder acceder, por ejemplo, a este complemento que estoy seleccionando sería abrir el XML que corresponde a esta factura, que es este de aquí, y entonces revisar ahí este información que tú requieres para saber qué fue lo que

**nomina bqs:** Ajá. Sí.

**Gustavo Ruiz (Dataholics):** te están pagando.

**nomina bqs:** Porque lo que yo hago es tomar el complemento que ya hice y ponerle la información de de la fecha en la que me apagaron al Excel de los colores.

**Gustavo Ruiz (Dataholics):** Okay. Básicamente lo que haces es en el Excel de los colores. Eh, déjame ver si es que te tengo que compartir toda la pantalla en vez de estar compartiéndote pestañas. Espérame, porque por eso es que no podemos estar en lo mismo. Ahí está.

### **00:18:07**

**Gustavo Ruiz (Dataholics):** Ahora sí. Bien. Te decía, eh, tú lo que tú dices, "Okay, tengo este de aquí. Vamos a hacer el ejemplo con este.

**nomina bqs:** ese pago corri ese yo o ya sea que lo tenga

**Gustavo Ruiz (Dataholics):** ¿Qué harías con este de aquí?

**nomina bqs:** físicamente o abrir el PDF o el XML para ver qué facturas fueron meterme

**Gustavo Ruiz (Dataholics):** ¿Y qué es lo que

**nomina bqs:** al Excel de

**Gustavo Ruiz (Dataholics):** cotejas? Esto de aquí,

**nomina bqs:** colores

**Gustavo Ruiz (Dataholics):** el este es lo que usas tú de referencia, el elit el esta cosa.

**nomina bqs:** el número de folio.

**Gustavo Ruiz (Dataholics):** Okay. Entonces, este de aquí tú lo vas a cotejar con con la con la información de la factura en PDF porque

**nomina bqs:** por

**Gustavo Ruiz (Dataholics):** necesitas la información para saber qué fue lo que te pagaron. Eh, para efecto del del de este reporte de acá, este de aquí, no necesitamos el que nos pagaron, ¿verdad? Sería nada más el puro monto de lo que, o sea, podríamos aprovechar ese a pesar de que llega complemento o no.

### **00:19:10**

**nomina bqs:** Eh, sí se podría aprovechar porque a veces en una sola transferencia me pagan hasta tres facturas. Entonces, por ejemplo, si entras a alguno de las pestañas esas, al ya sea el de pesos o el de colores, yo lo que hago es ponerle manualmente la fecha en la que me pagaron y el monto que me pagaron, pero por factura.

**Gustavo Ruiz (Dataholics):** Ya. Eh, sí. Okay, ya te entiendo. Es que son dos tareas diferentes porque podríamos cortar el camino y directamente decir, bueno, si no necesito separarlas porque lo que requiero es como el monto total, podría aprovecharlos para generar este reporte rápido sin pasar por el por la por el desglose de facturas. Eh,

**nomina bqs:** Ah,

**Gustavo Ruiz (Dataholics):** pero no sería lo ideal porque pues de todas maneras tú tendrías que hacer ese desglose manualmente.

**nomina bqs:** okay.

**Gustavo Ruiz (Dataholics):** Eso es lo que estoy entendiendo.

**nomina bqs:** Ajá. Sí, que es como lo hago ahorita.

**Gustavo Ruiz (Dataholics):** Sí. Okay. Entonces, lo que tendremos que hacer es es lograr hacer este proceso específico que haces de manera manual, tratar de automatizarlo y ya sea cotejándolo con con el PDF.

### **00:20:15**

**Gustavo Ruiz (Dataholics):** O sea, si yo te doy la posibilidad de de que el sistema te identifique todos los que te aparezcan como complemento y te diga, "Oye, este esta este folio este aparece que que es complemento. Necesitas decirme cuáles son las facturas que lo cubren, eh, y que te dé opción de cargar un XML y decirle, mira, es esta, esta y esta, estos tres XML." Entonces, ya que te lo que te ayude para completar el el proceso, ¿no?

**nomina bqs:** el proceso.

**Gustavo Ruiz (Dataholics):** Del XML, lo que tú sacas,

**nomina bqs:** Ajá.

**Gustavo Ruiz (Dataholics):** ¿qué es lo que extraes? Nada más, o sea, yo sé que es una pregunta muy obvia, pero necesito documentarla para que para que en el resumen me aparezca.

**nomina bqs:** Me desglosa qué número de factura es la que me está pagando y cuánto es el monto que me pagaron de cada factura.

**Gustavo Ruiz (Dataholics):** Okay. ¿Cómo identificas eso en campos? O sea, dime, ¿qué campos son los que te dicen esa información? Por ejemplo, ah, el me repites los los datos.

### **00:21:12**

**nomina bqs:** Eh, número de factura y el

**Gustavo Ruiz (Dataholics):** Okay. El monto sí, ahí viene perfectamente que es el total.

**nomina bqs:** monto.

**Gustavo Ruiz (Dataholics):** El número de factura es el el número este, el wid el el UUID,

**nomina bqs:** Ajá.

**Gustavo Ruiz (Dataholics):** perdón, el Sí, no es este el CFDI. Ese sería el que tú tomas de ahí del de la factura.

**nomina bqs:** Ese es el folio que me genera por haber hecho el complemento del pago,

**Gustavo Ruiz (Dataholics):** Okay. Pero no es el de la

**nomina bqs:** pero lo que viene dentro del no viene aparte el número de folio como

**Gustavo Ruiz (Dataholics):** factura.

**nomina bqs:** no sé el 45 71 pues el que tengo yo ahí a un lado de la fecha. Mira, déjame

**Gustavo Ruiz (Dataholics):** Este,

**nomina bqs:** te

**Gustavo Ruiz (Dataholics):** este este este aquí, ¿sí?

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** No,

**nomina bqs:** déjame te comparto. Acabo de hacer de hecho uno.

**Gustavo Ruiz (Dataholics):** me me das 3 minutitos. Voy a levantarme rápidamente.

### **00:22:11**

**Gustavo Ruiz (Dataholics):** Regreso en 3 minutitos. Sí.

**nomina bqs:** Sí, claro.

**Gustavo Ruiz (Dataholics):** Y muchas gracias.

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** Dame un segundo. Listo. Una disculpa. Eh, ay, no. Okay, entonces

**nomina bqs:** Mir ahí es el XML y un PDF de un complemento de pago.

**Gustavo Ruiz (Dataholics):** eh okay, déjame lo abro. Es este de aquí, ¿verdad?

**nomina bqs:** Sí,

**Gustavo Ruiz (Dataholics):** Okay. Fecha de

**nomina bqs:** pues obviamente si me dice ahí rápido qué factura es,

**Gustavo Ruiz (Dataholics):** pago.

**nomina bqs:** qué número de factura es y el XML también lo trae.

**Gustavo Ruiz (Dataholics):** Muy bien, muy bien, muy bien. Okay. Vamos a caminarle porque para no darle como muchas vueltas a esto. Esto lo voy a revisar con el equipo de de como de producción que de desarrollo para que me orienten ellos cómo podríamos hacer esa parte en particular. Eh, muy bien.

### **00:25:21**

**nomina bqs:** Okay.

**Gustavo Ruiz (Dataholics):** Vamos a retornar esta otra parte de acá en el motivo me

**nomina bqs:** Sí.

**Gustavo Ruiz (Dataholics):** aparece esto. Eh, muy bien. Entonces, ya tenemos como el tema del resumen, ya tenemos como el origen de las de las facturaciones y ya tenemos este el tema de del de cómo debe de verse el resumen para para los para el dashboard general. Voy a trabajar con esto y voy a mandarte un mensaje para ver si podemos agendar, ya sea antes de que termine esta semana, de una vez, el jueves o el viernes, para que podamos revisar como esta primera parte en demo contigo y verlo perfilando para que la semana que viene podamos sentarnos ya con Eric y contigo y entonces ya dar una revisada,

**nomina bqs:** Okay.

**Gustavo Ruiz (Dataholics):** pero por lo pronto sí me interesa que me dejes trabajar con esto para que en caso de algo yo te mando un mensajillo

**nomina bqs:** Okay.

**Gustavo Ruiz (Dataholics):** y yo creo que mañana en la tardecita te tengo como una propuesta de el el viernes temprano, me imagino, antes de que te vayas este sentarnos a platicar otra vez,

**nomina bqs:** Ajá.

**Gustavo Ruiz (Dataholics):** ¿va? Para mostrarte algo.

**nomina bqs:** Okay.

**Gustavo Ruiz (Dataholics):** S.

**nomina bqs:** Me parece muy bien.

**Gustavo Ruiz (Dataholics):** Te agradezco mucho, Elvia. Gracias por tu tiempo y pues de mi parte eso es

**nomina bqs:** Muchas gracias.

**Gustavo Ruiz (Dataholics):** todo.

**nomina bqs:** Muy bien, muchísimas gracias.

**Gustavo Ruiz (Dataholics):** Muchísimas gracias, Elvia. Estamos a la orden. S. Te agradezco mucho.

### **La transcripción finalizó después de 00:26:38**

*Esta transcripción editable se generó por computadora y puede contener errores. Los usuarios también pueden cambiar el texto después de que se cree.*