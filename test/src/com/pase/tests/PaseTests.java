package com.pase.tests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.concurrent.TimeoutException;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.pase.tests.pageobjects.PO_HomeView;
import com.pase.tests.pageobjects.PO_ListUsersView;
import com.pase.tests.pageobjects.PO_LogInView;
import com.pase.tests.pageobjects.PO_RegisterView;
import com.pase.tests.pageobjects.PO_View;
import com.pase.tests.util.SeleniumUtils;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class PaseTests {

	// En Windows (Debe ser la versión 46.0 y desactivar las actualizacioens
	// automáticas)):
	static String PathFirefox = "E:\\USER\\Desktop\\Firefox46.win\\FirefoxPortable.exe";
	// static String PathFirefox = "C:\\Users\\Pelayo Díaz
	// Soto\\Desktop\\Firefox46.win\\FirefoxPortable.exe";
	// En MACOSX (Debe ser la versión 46.0 y desactivar las actualizaciones
	// automáticas):
	// static String PathFirefox =
	// "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	// Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox);
	static String URL = "http://localhost:8081";

	public static WebDriver getDriver(String PathFirefox) {
		// Firefox (Versión 46.0) sin geckodriver para Selenium 2.x.
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	// Antes de cada prueba se navega al URL home de la aplicaciónn
	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	// Después de cada prueba se borran las cookies del navegador
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	// Antes de la primera prueba
	@BeforeClass
	static public void begin() {
	}

	// Al finalizar la última prueba
	@AfterClass
	static public void end() {
		//Borramos los cambios
		driver.navigate().to(URL+"/borrarPruebas/laLoles@gmail.com");
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	/**
	 * Prueba del formulario de registro. registro con datos correctos
	 */
	@Test
	public void P01_RegVal() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "signup", "class", "btn btn-primary");
		// Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "registro");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "laLoles@gmail.com", "Loles", "Fuentes", "123456", "123456");
		// Comprobamos que nos dirige al login
		PO_View.checkElement(driver, "id", "login");
	}

	/**
	 * Prueba del formulario de registro
	 * Email repetido o demasiado corto
	 * Nombre y apellidos demasiado cortos
	 */
	@Test
	public void P02_RegInval() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "signup", "class", "btn btn-primary");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "registro");
		// Rellenamos el formulario: email repetido.
		PO_RegisterView.fillForm(driver, "laLoles@gmail.com", "Josefo", "Perez", "77777", "77777");
		// Comprobamos que permanecemos en la página.
		PO_View.checkElement(driver, "id", "registro");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Ya existe un usuario con ese email");
		
		// Comprobamos el error de nombre corto
		PO_RegisterView.fillForm(driver, "laLore@yahoo.com", "L", "Reinols", "77777", "77777");
		// Comprobamos que permanecemos en la página.
		PO_View.checkElement(driver, "id", "registro");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Nombre demasiado corto");
		
		// Comprobamos el error de apellido corto
		PO_RegisterView.fillForm(driver, "laLore@yahoo.com", "Lorena", "R", "77777", "77777");
		// Comprobamos que permanecemos en la página.
		PO_View.checkElement(driver, "id", "registro");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Apellido demasiado corto");
				
		// Comprobamos el error de contraseña corta
		PO_RegisterView.fillForm(driver, "laLore@yahoo.com", "Lorena", "Reinols", "123", "123");
		// Comprobamos que permanecemos en la página.
		PO_View.checkElement(driver, "id", "registro");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Password demasiado corta");
		
		// Comprobamos el error de contraseñas no coincidentes
		PO_RegisterView.fillForm(driver, "laLore@yahoo.com", "Lorena", "Reinols", "123456", "654321");
		// Comprobamos que permanecemos en la página.
		PO_View.checkElement(driver, "id", "registro");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Las passwords no coinciden");
	}
	
	/**
	 * Inicio de sesión fallido
	 *  - Usuario no existente
	 *  - Contraseña no coincide
	 */
	@Test
	public void P03_InInVal() {
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "noExisto@gmail.com", "123456");
		//Comprobamos el fallo comporbando que seguimos en la página
		PO_View.checkElement(driver, "id", "login");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
		
		//Rellenamos el formulario: Contraseña inválida
		PO_LogInView.fillForm(driver, "laLoles@gmail.com", "1234567");
		PO_View.checkElement(driver, "id", "login");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}
	
	/**
	 * Inicio de sesión válido y acceso a listado de usuarios
	 */
	@Test
	public void P04_InVal_LisUsrVal(){
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "login");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laLoles@gmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_ListUsersView.checkElement(driver, "id", "listadoUsuarios");
	}
	
	/**
	 *  Intento de acceso con URL desde un usuario no identificado al listado de usuarios
	 *	desde un usuario en sesión
	 */
	@Test
	public void P05_LisUsrInVal(){
		// Intentamos acceder al listado de usuarios sin logearnos /user/list
		driver.navigate().to(URL+"/user/list");
		//Comprobamos que se nos redirige a la pagina de inicio de sesion
		PO_LogInView.checkElement(driver, "id", "login");
	}
	
	/**
	 * Realizar una búsqueda valida en el listado de usuarios desde un usuario en sesión
	 */
	@Test
	public void P06_BusUsrVal() {
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Comprobamos que estamos en la página correcta
		PO_ListUsersView.checkElement(driver, "id", "login");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laLoles@gmail.com", "123456");
		//Comprobamos que estamos en la pagina de listado de usuarios
		PO_LogInView.checkElement(driver, "id", "listadoUsuarios");
		//Realizamos la busqueda por nombre
		PO_ListUsersView.fillForm(driver, "Paco");
		//Comprobamos que aparece el usuario en la pagina y solo el
		List<WebElement> elementos = PO_View.checkElement(driver, "text", "elPaco-@hotmail.com");
		assertTrue(elementos.size()==1);
		//Realizamos la busqueda por email
		PO_ListUsersView.fillForm(driver, "Paca@");
		//Comprobamos que aparece el usuario en la pagina y solo el
		elementos = PO_View.checkElement(driver, "text", "laPaca@gmail.com");
		assertTrue(elementos.size()==1);
	}
	
	
	/**
	 * 	Intento de acceso con URL a la búsqueda de usuarios desde un usuario no
	 *	identificado. Debe producirse un acceso no permitido a vistas privadas
	 */
	@Test
	public void P07_BusUsrInVal(){
		// Intentamos acceder al listado de usuarios sin logearnos /user/list
		driver.navigate().to(URL+"/user/list?busqueda=Paca%40");
		//Comprobamos que se nos redirige a la pagina de inicio de sesion
		PO_LogInView.checkElement(driver, "id", "login");
	}
	
	@Test
	/**
	 *  P08: Enviar una invitación de amistad a un usuario de forma valida. 
	 *  P09: Enviar una invitación de amistad a un usuario al que ya le habíamos invitado la invitación
	 *	previamente. No debería dejarnos enviar la invitación, se podría ocultar el botón de enviar invitación o
	 *	notificar que ya había sido enviada previamente
	 */
	public void P08_InvVal_P09_InvInVal(){
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laLoles@gmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_ListUsersView.checkElement(driver, "id", "listadoUsuarios");
		// Esperamos a que se muestren los enlaces de paginación la lista de usuarios
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Nos vamos a la última página
		elementos.get(3).click();
		//Presionar sobre boton "Enviar peticion de amistad"
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/peticion/mandar/')]");
		elementos.get(0).click();
		int tamaño1 = elementos.size();
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		// Esperamos a que se muestren los enlaces de paginación la lista de usuarios
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		// Nos vamos a la última página
		elementos.get(3).click();
		//Comprobamos que el número de botones se ha reducido, es decir, que no se puede volver a mandar la petición.
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/peticion/mandar/')]");
		int tamaño2 = elementos.size();
		assertTrue(tamaño1==tamaño2+1);
	}
	
	/**
	 * Listar las invitaciones recibidas por un usuario
	 */
	@Test
	public void P10_LisInvVal() {
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laMonse@gmail.com", "123456");
		//Comprobamos que estamos en la página privada
		PO_ListUsersView.checkElement(driver, "id", "listadoUsuarios");
		//Vamos a la vista peticiones de amistad - href="/request/list"
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href,'peticion/list')]");
		elementos.get(0).click();
		//Comprobamos que estamos en la vista de peticiones de amistad
		PO_ListUsersView.checkElement(driver, "id", "peticiones");
		//Comprobar tamaño de la tabla para ver que hay peticiones
		List<WebElement> peticiones = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(peticiones.size() > 0);
	}
	
	/**
	 *  Aceptar una invitación recibida. Lanza excepcion pues no encuentra tr
	 */
	@Test(expected=org.openqa.selenium.TimeoutException.class)
	public void P11_AcepInvVal() throws TimeoutException{
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laMonse@gmail.com", "123456");
		//Comprobamos que estamos en la página privada
		PO_ListUsersView.checkElement(driver, "id", "listadoUsuarios");
		//Vamos a la vista peticiones de amistad - href="/request/list"
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href,'peticion/list')]");
		elementos.get(0).click();
		//Comprobamos que estamos en la vista de peticiones de amistad
		PO_ListUsersView.checkElement(driver, "id", "peticiones");
		//Comprobar tamaño de la tabla
		List<WebElement> peticiones = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(peticiones.size() > 0);
		int tamaño = peticiones.size();
		//Presionar sobre boton "Aceptar peticion de amistad"
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href,'/peticion/aceptar/')]");
		elementos.get(0).click();
		//Vamos a la vista peticiones de amistad - href="/request/list"
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href,'peticion/list')]");
		elementos.get(0).click();
		PO_View.setTimeout(2);
		//Vemos que el tamaño de la tabla ha disminuido en 1
		peticiones = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		PO_View.setTimeout(5);
//		assertTrue(peticiones.size()==tamaño-1);
	}
	
	/**
	 *  Listar los amigos de un usuario, realizar la comprobación con una lista que al menos
	 *	tenga un amigo.
	 */
	@Test
	public void P12_ListAmiVal() {
		// Vamos al formulario de incio de sesion
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LogInView.fillForm(driver, "laMonse@gmail.com", "123456");
		//Comprobamos que estamos en la página privada
		PO_ListUsersView.checkElement(driver, "id", "listadoUsuarios");
		//Vamos a la vista peticiones de amistad - href="/request/list"
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//a[contains(@href,'user/friendsList')]");
		elementos.get(0).click();
		//Comprobamos que estamos en la vista de listas de amigos
		PO_ListUsersView.checkElement(driver, "id", "listadoAmigos");
		//Comprobar tamaño de la tabla
		List<WebElement> peticiones = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(peticiones.size() > 0);
	}
	
	/**
	 * Inicio de sesión fallido
	 *  - Usuario no existente
	 *  - Contraseña no coincide
	 */
	@Test
	public void P13_CInInVal() {
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "noExisto@gmail.com", "123456");
		//Comprobamos el fallo comporbando que seguimos en la página
		PO_View.checkElement(driver, "id", "login");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Usuario no encontrado");
		
		//Rellenamos el formulario: Contraseña inválida
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "1234567");
		PO_View.checkElement(driver, "id", "login");
		//Comprobamos el error
		PO_View.checkElement(driver, "text", "Usuario no encontrado");
	}
	
	/**
	 * Inicio de sesión válido
	 */
	@Test
	public void P14_CInVal_CListAmiVal() {
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> amistades = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(amistades.size() >= 3);
	}
	
	/**
	 *  Acceder a la lista de amigos de un usuario, y realizar un filtrado para encontrar a un
	 *	amigo concreto, el nombre a buscar debe coincidir con el de un amigo.
	 */
	@Test
	public void P15_CListAmiFil() {
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> amistades = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(amistades.size() >= 3);
		//Envíamos el criterio de busqueda
		WebElement email = driver.findElement(By.id("filtro-nombre"));
		email.click();
		email.clear();
		email.sendKeys("Pili");
		//Comprobar tamaño de la tabla para ver las amistades despues del filtrado
		amistades = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
			PO_View.getTimeout());
		assertTrue(amistades.size() >= 1);
	}
	
	/**
	 * Acceder a la lista de mensajes de un amigo “chat”, la lista 
	 * debe contener al menos tres mensajes.
	 */
	@Test
	public void P16_CListMenVal() {
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
					PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Buscamos el enlace al chat
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//a[contains(@onclick,'chat')]",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Presionamos el enlace
		elements.get(0).click();
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-chat");
		try {
			Thread.sleep(5000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobamos que existen los mensajes
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li",
				PO_View.getTimeout());
		assertTrue(elements.size() > 3);
	}
	
	/**
	 * Acceder a la lista de mensajes de un amigo “chat” y crear un nuevo mensaje, 
	 * validar que el mensaje aparece en la lista de mensajes
	 */
	@Test
	public void P17_CCrearMenVal() {
		PO_View.setTimeout(10); //Aumentamos el tiempo de espera tolerable
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
					PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Buscamos el enlace al chat
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//a[contains(@onclick,'chat')]",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Presionamos el enlace
		elements.get(0).click();
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-chat");
		//Guardamos el numero de mensajes
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		int tamaño1 = elements.size();
		// Introducimos el nuevo mensaje
		WebElement mensaje = driver.findElement(By.id("input-chat"));
		mensaje.click();
		mensaje.clear();
		mensaje.sendKeys("Test 17");
		//Pulsar el boton de Alta.
		By boton = By.id("btn-chat");
		driver.findElement(boton).click();
		try {
			Thread.sleep(6000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		// Comprobamos que el numero de mensajes se ha incrementado en uno
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li",
				PO_View.getTimeout());
		assertTrue(tamaño1+1==elements.size());
	}
	
	/**
	 * Identificarse en la aplicación y enviar un mensaje a un amigo, validar que el
	 * mensaje enviado aparece en el chat. Identificarse después con el usuario que recibido el mensaje y validar
	 * que tiene un mensaje sin leer, entrar en el chat y comprobar que el mensaje pasa a tener el estado leído.
	 * Utilizaremos el mensaje de la prueba anterior.
	 * 
	 * Esta prueba se realiza con el mensaje enviado en la prueba anterior
	 */
	@Test
	public void P18_CMenLeidoVal() {
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPili@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
					PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobamos que tiene un mensaje sin leer
		elements = SeleniumUtils.EsperaCargaPagina(driver, "text", "1",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Buscamos el enlace al chat
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//a[contains(@onclick,'chat')]",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Presionamos el enlace
		elements.get(0).click();
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-chat");
		// Comprobamos que existe el mensaje
		elements = SeleniumUtils.EsperaCargaPagina(driver, "text", "Test 17",
				PO_View.getTimeout());
		assertTrue(elements.size()==1);
		//Comprobamos que el numero de mensajes leídos es igual al numero de mensajes totales
		int tamaño1 = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li", PO_View.getTimeout()).size();
		int tamaño2 = SeleniumUtils.EsperaCargaPagina(driver, "text", "do **",PO_View.getTimeout()).size()-1;
		assertEquals(tamaño1, tamaño2);
	}
	
	/**
	 * Identificarse en la aplicación y enviar tres mensajes a un amigo, 
	 * validar que los mensajes enviados aparecen en el chat. Identificarse 
	 * después con el usuario que recibido el mensaje y validar que el número 
	 * de mensajes sin leer aparece en la propia lista de amigos.
	 */
	@Test
	public void P19_CListaMenNoLeidoVal() {
		PO_View.setTimeout(10); //Aumentamos el tiempo de espera tolerable
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPaca@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(1000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobar tamaño de la tabla para ver las amistades
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
					PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Buscamos el enlace al chat
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//a[contains(@onclick,'chat')]",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		//Presionamos el enlace
		elements.get(0).click();
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-chat");
		//Guardamos el numero de mensajes
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li",
				PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		int tamaño1 = elements.size();
		// Introducimos los nuevos mensajes
		WebElement mensaje = driver.findElement(By.id("input-chat"));
		By boton = By.id("btn-chat");
		for (int i=0; i<3; i++) {
			mensaje.click();
			mensaje.clear();
			mensaje.sendKeys("Test 19-"+i);
			//Pulsar el boton de Alta.
			driver.findElement(boton).click();
		}
		try {
			Thread.sleep(5000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Comprobamos que el numero de mensajes ha incrementado en 3
		elements = SeleniumUtils.EsperaCargaPagina(driver, "free", "//li",
				PO_View.getTimeout());
		assertTrue(elements.size()==tamaño1+3);
	}
	
	/**
	 * Inicio de sesión válido y acceso a listado de amistades
	 */
	@Test
	public void P20_CListaMenNoLeidoVal() {
		// Vamos al formulario de incio de sesion
		driver.navigate().to("http://localhost:8081/cliente.html");
		//Comprobamos que estamos en la página correcta
		PO_View.checkElement(driver, "id", "widget-login");
		
		//Rellenamos el formulario: Usuario no existe
		PO_LogInView.fillForm(driver, "laPili@gmail.com", "123456");
		//Comprobamos que accedemos a la página de listar amigos
		PO_View.checkElement(driver, "id", "widget-friendsList");
		try {
			Thread.sleep(4000); //Para darle tiempo a recargar la pagina
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//Buscamos que halla al menos una linea con tres mensajes nuevos
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "text", "3",
					PO_View.getTimeout());
		assertTrue(elements.size() > 0);
		
	}
	
}
