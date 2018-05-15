package com.pase.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ListUsersView extends PO_NavView {

	static public void fillForm(WebDriver driver, String searchp) {
		WebElement search = driver.findElement(By.name("busqueda"));
		search.click();
		search.clear();
		search.sendKeys(searchp);
		//Pulsar el boton de Alta.
		By boton = By.id("search");
		driver.findElement(boton).click();
	}
	
	
}
