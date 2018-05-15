package com.pase.tests.pageobjects;

import org.openqa.selenium.WebDriver;

import com.pase.tests.util.SeleniumUtils;

public class PO_HomeView extends PO_NavView {

	static public void checkWelcome(WebDriver driver, int language) {
		//Esperamos a que se cargue el saludo de bienvenida en Español
		SeleniumUtils.EsperaCargaPagina(driver, "text", "PACA", getTimeout());
	}
}
