package com.smartapproval.exception; public class InvalidDecisionException extends RuntimeException { public InvalidDecisionException(){super("La solicitud ya tiene una decisión final");} }
