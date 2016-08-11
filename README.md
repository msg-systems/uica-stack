# msg-js-spa-framework

JavaScript SinglePageApp(SPA) Framework is a lightweight framework for building SPA libraries.

<p/>
<img src="https://nodei.co/npm/msg-js-spa-framework.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/msg-systems/msg-js-spa-framework.png" alt=""/>

## Purpose
The `msg-js-spa-framework` is the optional large HTML5 Rich-Client
framework for providing common functionality to the applications, either
by itself or through embedded third-party libraries and frameworks.

Major goals are:

- Definition of a standard set of third-party libraries and frameworks used for SPA development
- Using the `msg-js-spa-framework` should therefor minimize the configuration time of the SPA library building in concrete SPA projects    

## Getting started

To build an SPA project based on `msg-js-spa-framework` you have to install it via npm (shell or package.json):

```shell
npm install msg-js-spa-framework --save-dev
```

Once it is installed, add a `delivery.yaml` to the SPA's root folder. `msg-js-spa-framework` is based upon [delivery-packer](https://github.com/msg-systems/delivery-packer) which handles the library artifact creation. Based on `delivery.yaml` files the delivery artifact can be assembled.

So basically `msg-js-spa-framework` only assembles the proper JavaScript frameworks to a delivery artifact. And due to the fact that [delivery-packer](https://github.com/msg-systems/delivery-packer) is modular - concrete SPA projects can take advantage of `msg-js-spa-framework` by simply importing it into their `delivery.yaml`.
 

```yaml
import:
# use the msg-js-spa-framework as base
- msg-js-spa-framework
# you might add new delivery parts needed by the SPA project
- {path_to_project_deliverables}/**/*.yaml

build:
# you might exclude deliverables from the msg-js-spa-framwork if you want/have to (note they all start with spa-fw.)
- "!spa-fw.componentjs"
# and add proper replacements on your own - just ensure that those alias names are registered
- {yournamespace}.angularjs
```

If that `delivery.yaml` is fully configured - run the `delivery-packer` either with the grunt plugin or with the command line interface (see [delivery-packer](https://github.com/msg-systems/delivery-packer)).

Include the artifact output of the `delivery-packer` into your SPA HTML file.

## Behind the scene

Creating an UI Application typically considers all functional requirements and tries to map those to an technical - *developable* - view. 

Typical functional requirements and a possible layer concept as a technical view will be detailed further below. 

### Functional requirements
Single page applications face alot of functional requirements like:

- DOM-Manipulation
- HTML Markups
- HTML Styling using CSS
- Responsive Design
- Browser navigation
- Drag & Drop
- Browser differences and incompatibilities
- Internationalization / Localization
	- Dates
	- Numbers
	- Texts
- Error handling
- Keyboard control
- Touch and gesture control
- Symbols, icons and images
- UI Widgets
- and many more

### 12 layers of an UI application

Coming from the users point of view and going thru the UI application until the backend takes over we face different layers of concern:

1.  __Interaction Concept__:<br>
    e.g. Mouse, Keyboard, Touchscreen, Gesture, Dialog Flow

2.  __Optical Theme__:<br>
    e.g. Shape, Color, Gradient, Shadow, Font, Icon

3.  __Interface States__:<br>
    e.g. Rendered, Enabled, Visible, Focused, Animated, Warning, Error

4.  __Interface Elements__:<br>
    e.g. Icon, Label, Text Paragraph, Image, Form, Text-Field, Text-Area, 
    Date Picker, Toggle, Radio Button, Checkbox, Select List, Slider, 
    Progress Bar, Hyperlink, Popup Menu, Dropdown Menu, Toolbar, Tab, 
    Pill, Breadcrumb, Pagination, Badge, Alert

5.  __Interface Layouting__:<br>
    e.g. Responsive Design, Media Query, Panel, Modal, Frame, Grid, Table,
    Padding, Border, Margin, Alignment, Force, Magnetism

6.  __Mask Rendering__:<br>
    e.g. Markup Generation, Value Formatting, Virtual DOM

7.  __Data Binding__:<br>
    e.g. Reactive, Observer, Value Converting, Unidirectional, 
    Bidirectional, Incremental

8.  __Presentation Model__:<br>
    e.g. Parameter, Command, State, Data, Event

9.  __Dialog Control__:<br>
    e.g. Service, Event, Model, Socket

10. __Dialog Structure__:<br>
    e.g. Model, View, Controller, Hierarchical Composition

11. __Business Model__:<br>
    e.g. Entity, Field, Relationship

12. __Backend Communication__:<br>
    e.g. Request/Response, Synchronization, Push, Pull, Pulled-Push

Using a single framework like [AngularJS](https://angularjs.org/) or [ExtJS](https://www.sencha.com/products/extjs/#overview) often does not adress all layers of the UI application and you end up in taking other third party libraries into your application. 

## Standard set of frameworks 

`msg-js-spa-framework` cherry picks the best frameworks to cover most of the layers. Some layers will not be handled by `msg-js-spa-framework` since they are too application specific and should not be handled globally like 'Interface Elements' or 'Optical Theme'. 

Each concrete SPA must fill this layers with proper libraries or frameworks on its own. Take a look at [msg-js-spa-widgets](https://github.com/msg-systems/msg-js-spa-widgets) if you need assistance for layer 'Interface Elements' and 'Optical Theme'.

The following table lists all frameworks and libraries mapped to the 12 UI layers (technical view). Some libraries could not be mapped to a specific UI layer since they cover a global purpose needed by web applications like browser incompatibilities or JavaScript language basics.

<table style="width:100%">
<tbody>
  <tr>
	<th width="50%">Framework</th>
	<th width="10%">Version</th>
	<th width="10%">Relevance</th>
	<th>global purpose</th>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/console-polyfill'><img src="https://nodei.co/npm/console-polyfill.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.2.2</td>
	<td>JS</td>	
	<td rowspan="5">Browser incompatibilities</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/es5-shim'><img src="https://nodei.co/npm/es5-shim.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.5.9</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/json-js'><img src="https://nodei.co/npm/json-js.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.1.2</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/Base64'><img src="https://nodei.co/npm/Base64.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.0.0</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/normalize.css'><img src="https://nodei.co/npm/normalize.css.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.2.0</td>
	<td>CSS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/modernizr'><img src="https://nodei.co/npm/modernizr.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.3.1</td>
	<td>JS</td>
	<td>Browser feature detection</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/lodash'><img src="https://nodei.co/npm/lodash.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.14.1</td>
	<td>JS</td>
	<td>Array handling</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/js-htmlencode'><img src="https://nodei.co/npm/js-htmlencode.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.1.0</td>
	<td>JS</td>
	<td>HTML Encoding/Decoding</td>
  </tr>
  <tr>
   	<td><a href='https://www.npmjs.com/package/bluebird'><img src="https://nodei.co/npm/bluebird.png?downloads=true&stars=true" alt=""/></a></td>
   	<td>3.4.1</td>
   	<td>JS</td>
   	<td>Promises</td>
  </tr>
</tbody>
</table>

<table style="width:100%">
<tbody>
  <tr>
	<th width="50%">Framework</th>
	<th width="10%">Version</th>
	<th width="10%">Relevance</th>
	<th>Layer</th>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/mousetrap'><img src="https://nodei.co/npm/mousetrap.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.6.0</td>
	<td>JS</td>
	<td>1. Interaction Concept - Keyboard</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/hammerjs'><img src="https://nodei.co/npm/hammerjs.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.0.8</td>
	<td>JS</td>
	<td>1. Interaction Concept - Touch, Gesture</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/animate.css'><img src="https://nodei.co/npm/animate.css.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.5.1</td>
	<td>CSS</td>
	<td>3. Interface States<br>6. Mask Rendering</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery'><img src="https://nodei.co/npm/jquery.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.2.4</td>
	<td>JS</td>
	<td>3. Interface States<br>6. Mask Rendering<br>7. Data Binding (manual)</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery-markup'><img src="https://nodei.co/npm/jquery-markup.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.0.36</td>
	<td>JS</td>
	<td>6. Mask Rendering</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/vue'><img src="https://nodei.co/npm/vue.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.0.0-beta.6</td>
	<td>JS</td>
	<td>6. Mask Rendering<br>7. Data Binding (programmatic)</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/handlebars'><img src="https://nodei.co/npm/handlebars.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.0.5</td>
	<td>JS</td>
	<td>6. Mask Rendering - Template engine</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/moment'><img src="https://nodei.co/npm/moment.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.14.1</td>
	<td>JS - Date</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/numeral'><img src="https://nodei.co/npm/numeral.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.5.3</td>
	<td>JS - Number</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/i18next'><img src="https://nodei.co/npm/i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.4.1</td>
	<td>JS - String</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/i18next-xhr-backend'><img src="https://nodei.co/npm/i18next-xhr-backend.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.1.0</td>
	<td>JS - String</td>
	<td>12. Backend Communication - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery-i18next'><img src="https://nodei.co/npm/jquery-i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.0.0</td>
	<td>HTML DOM</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/componentjs'><img src="https://nodei.co/npm/componentjs.png?downloads=true&stars=true" alt=""/></a><br>
	Additionally abstract classes and traits for ComponentJS are provided.<br>
	See <a href="#abstractClasses">Standard set of abstract classes, traits and components</a> for detailed information.
	</td>
	<td>1.4.1</td>
	<td>JS</td>
	<td>8. Presentation Model<br>9. Dialog Control<br>10. Dialog Structure</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/datamodeljs'><img src="https://nodei.co/npm/datamodeljs.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.3.1</td>
	<td>JS</td>
	<td>11. Business Model</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/qwest'><img src="https://nodei.co/npm/qwest.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.4.5</td>
	<td>JS</td>
	<td>12. Backend Communication - AJAX</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/socket.io-client'><img src="https://nodei.co/npm/socket.io-client.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.4.8</td>
	<td>JS</td>
	<td>12. Backend Communication - WebSockets</td>
  </tr></tbody>
</table>

<h2 id="abstractClasses">Standard set of abstract classes, traits and components</h2>

Next to the libraries and frameworks the `msg-js-spa-framework` provides abstract classes, traits (mixins) and components.

### abstract classes

For each part of a component (controller, model and view) a abstract class is provided. They represent an abstract layer to work with ComponentJS. Every component must extend from this abstract class.

<ul>
<li>controller: app.fw.abstract.ctrl</li>
<li>model: app.fw.abstract.model</li>
<li>view: app.fw.abstract.view</li>
</ul>


### traits
The `msg-js-spa-framework` provides some helpful traits. Some of them are already mixed in in the components of the `msg-js-spa-framework`, some can be mixed in to your specific components, if needed. 

#### i18next
This trait handles the loading of the i18next-keys from the backend. By default this trait is included by the root-component.

The default value for the resourcePath is 'app/{{lng}}-translation.json', but can be overwritten from the specific root component of your application.

The specific root component must implement the function 'userLanguage' to return the current language of the application.
<ul>
<li>controller: app.fw.trait.root.i18next.ctrl</li>
</ul>

#### serviceError
The default error handling callback for service methods is available through mixing in this trait. It is already mixed in the abstract component. So of the error handling is taking care due extending from this component.

<ul>
<li>controller: app.fw.trait.abstract.serviceError.ctrl</li>
</ul>

When the result object is an error object, this method takes care of the error analysis and it creates the proper messages and throws it to the top level error handler with publish("fw:handleError"). To react to the error, the event "fw:handleError" must be subscribed.


#### registerAPI
Sometimes it is neccassary that the controller can asked its view about a markup. If that is needed, this trait must be mixed in, to the specific view.
Generally a Controller should only call a registered method of the view to get a views markup.

<ul>
<li>view: app.fw.trait.abstract.registerAPI.view</li>
</ul>


### components
Each application needs a service and a root component. The `msg-js-spa-framework` provides a service and a root component with some basic functionalities that can be extended.

The service component only should recieve events fromt the root component. For this purpose it provides an wrapper function 'registerService'. For the communication between the service and the root component, the root component provides the counterpart of this wrapper function - 'subscribeDataService'.

#### service
The service component, is the only component that is not devided into controller, model and view, because it does not need a own model and a user interface. 
It is neccassary to extend from this service component to use its provided function.


<ul>
<li>app.fw.sv</li>
</ul>

Its major task is the communictaion with the backend. Therefore the method *registerService (methodName, serviceName, serviceFunction, callbackFunction[optional])* is provided. 

	// EXAMPLE for calling registerService:
	// the variable self.serviceRoot was defined before
	
	self.registerService('GET', 'readClaimPositions', function (client, claimNumber, callback) {
    	return {
        	options: {{object: options}},
            serviceURL: {{string: URL resolved with given parameters "client" and "claimNumber"}},
            callback: callback
        };
    });
The available options you can find at the documentation from **[qwest](https://github.com/pyrsmk/qwest)**, as **[qwest](https://github.com/pyrsmk/qwest)** is used internal for the service-calls.
For default service options, the variable *defaultServiceOptions* is defined and set to *{dataType: 'json'}* by default. It is possible to overwrite this variable.

Furthermore it provides functions to set and get the service-root-URL and to get the service-URL of a given service.


#### root
A specific root component is responsible for a lot of tasks.

This basic root component provides the handling of window resizing.
It provides a function for all components to read the service-URL from a specific service from the service component. Furthermore it includes the traits *app.fw.trait.root.i18next.ctrl* and *app.fw.trait.abstract.serviceError.ctrl*.
<ul>
<li>controller: app.fw.root.ctrl</li>
<li>model: app.fw.root.model</li>
<li>view: app.fw.root.view</li>
</ul>


<h2>Style Mixins</h2>
The `msg-js-spa-framework` includes some useful mixins for styling as well. This can be used through importing the file *spa-fw.less* in your .less-files:

		@import "../../../../node_modules/msg-js-spa-framework/src/app/spa-fw";


<h2>Mockdata Registry</h2>
A mockdata registry is also delivered by the `msg-js-spa-framework`. To use it, it needs to be required:

		require('msg-js-spa-framework/mockdata-registry')
