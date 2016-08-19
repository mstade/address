# Address

## [Get started with Address][get-started]

## What is Address?

Address is the [application programming interface (API)](http://en.wikipedia.org/wiki/API) library for [resource oriented architecture (ROA)](http://en.wikipedia.org/wiki/Resource-oriented_architecture), where each resource is an addressable action with a [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier).

### It provides
 * an API for configuring and invoking requests for resources,
 * utilities for creating appropriate responses from resources,
 * utilities for displaying resources in the DOM.

## What are the benefits?

* ### Unifying
  * Unify the resources from multiple developer teams
  * Create a common way to navigate to and load resources
  * Compose new resources from already existing ones
* ### Extensible
  * The list of resources can be extended during runtime
  * Define [middlewares](https://en.wikipedia.org/wiki/Middleware) to add custom behavior to existing resources
* ### Open, based on standards
  * Address is based on open standards and built with open source software
  * Uses HTTP methods and content negotiation to decide which resource to load
  * Uses Universal Module Definition (UMD) for easy integration
* ### Lightweight
  * Address only has a few dependencies
  * Resources can be implemented with any framework
  * Resource definitions are small and easy to understand

## What does it do?

Address gives an API to address behavior with URIs using HTTP methods and content negotiation to choose the required action to be executed. It also serves as a router to react to changes in the URL of the current website, and also can manipulate the location to navigate to a different section of your [single-page application (SPA)](https://en.wikipedia.org/wiki/Single-page_application).

## What can you use it with?

Address can be used with any framework and any module loader, so you can easily integrate it to you workflow. Resources are just assumed to be functions that are called when you address their URL. Different resources can be implemented using different frameworks or libraries, so multiple teams can work on the same application, with just agreeing to use Address resources.

## [Get started with Address][get-started]

[get-started]: https://www.npmjs.com/package/@zambezi/address "@zambezi/address"