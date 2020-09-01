/* 

Prompt:
  We have defined a basic dropdown via the Dropdown and DropdownItem components below, with example usage in the ExampleNav component.
  The Dropdown and DropdownItem components have some problems, and also have room for improvements.
  Please fix any obvious bugs you see with the dropdown, and explain your reasoning.
  Please then describe some improvements you would make to the dropdown, and how you would implement them.
  Consider the different contexts in which you might use this dropdown and what changes might be neccessary to make it more flexible.
  
  Follow up question: if we wanted to sync this dropdown selection to the server with app.sync('PATCH', 'user', { dropdown_1_state: {true,false} }) where would this be included
  
  PS: No need to worry about CSS.

 */

/*

 what did i do?

x.  used prettier to format code, so it doesn't take more than 80 columns:
        easier to read, easier to work with.
x.  removed super(props):
        when PureComponent is inherited, there's no need for super(props)
x.  there was a typo in constructor
x.  line 89, removed constructor:
        constructor() { this.state = {} } can be simplified to state = {}
x.  line 93, simplifying toggle():
        instead of binding it to `this` inside the constructor, we can
        simply make it an arrow function, the reason this works is that
        in javascript, arrow functions are lexically scoped.
x.  line 95, fixed a mistake, toggle wasn't really toggling isOpen value.
x.  line 96, changed {isOpen: isOpen} to {isOpen} (ES6).
x.  line 110, moved class list to a new function:
        when the number of conditional-classes of an element increases,
        specially more than two, the code becomes very unreadable, thus
        it's better to have a function that returns the list of classes.
x.  line 118 & 101: deconstructed children from props
x.  line 118: made showing the children conditional:
        not returning children at all when dropdown menu is closed can avoid
        unnecessary rendering in the browser & slightly improve performance.
x.  line 131: created the DropDownItem class. 
x.  line 131: converted DropDownItem to a function: it's stateless.
x.  line 131: an effort to make DropDownItem more flexible:
        any props given to DropDownItem, now applies to <li>
x.  line 137: ExampleNav can be edited:
        but that's actually the code used to implement the menu, and has nothing
        to do with DropDown class itself. depending on the situation, it can be
        modified of course, e.g. if we have a list of pages, we can loop through
        them using pages.map(p => <DropDownItem href={p.href}>p.text</DropDownItem)
x.  line 156: exported Example to test it, in production, we need to export DropDown
        & DropDownItem too :) (export DropDown / export DropDownItem)

Follow up question:
    what I got from your question is that you need to notify the server whether
    the dropdown is open or not. in that cast, in line 96, setState needs
    to be replaced with setState({isOpen}, ()=>this.notifyServer()), this will
    call notifyServer() every time isOpen state changes. finally we have to add
    notifyServer function to DropDown, which will be:
    const notifyServer = () => {
        const { isOpen } = this.state;
        app.sync('PATCH', 'user', { dropdown_1_state: isOpen })
    }
    Note: this is only if EVERY dropDownMenu need to call notifyServer(), otherwise
    we have to implement it in a different way, so... method 2:
    the dropDownClass notifies its parent that its state is changed, if
    necessary, the parent calls the server. this is done by passing a function
    as a prop to the DropDown class:
    first, we replace setState with setState({isOpen}, ()=>this.props.changed(isOpen))
    then, from its parent we pass a function to DropDown like this:
    <DropDown changed={this.dropDownChanged} />
    finally, we add this function to the parent:
    const dropDownChanged = isOpen => {
        app.sync('PATCH', 'user', { dropdown_1_state: isOpen })
    }

Some opinions:
x.  if the list of items is received from the server, it's better to modify the
        DropDown class such that it receives a json as a prop and makes its own children.
x.  in this code, DropDown items are links, but we might need to show other stuff too,
        say a checkbox or anything other than <li><a></a></li>, I'm not sure about such
        cases, but if yes, then we need to rewrite DropDown. we can write a base
        class and then create inherited classes for different purposes, examples will be:
        LinkDDItem, CheckBoxDDItem, HintDDItem, etc.
 */

import React, { PureComponent } from 'react';

class Dropdown extends PureComponent {
	state = {
		isOpen: false,
	};

	toggle = () => {
		let { isOpen } = this.state;
		isOpen = !isOpen;
		this.setState({ isOpen });
	};

	render() {
		const { isOpen } = this.state;
		const { label, children } = this.props;

		return (
			<div className='dropdown'>
				<button
					type='button'
					className='dropdown-button'
					id='dropdownButton'
					aria-haspopup='true'
					onClick={this.toggle}>
					{label}
				</button>

				<ul
					className={this.ulClassList()}
					aria-labelledby='dropdownButton'
					role='menu'>
					{isOpen && children}
				</ul>
			</div>
		);
	}

	ulClassList = () => {
		const classList = ['dropdown-menu'];
		if (this.state.isOpen) classList.push('dropdown-open');
		return classList.join(' ');
	};
}

const DropdownItem = ({ href, children, ...otherProps }) => (
	<li {...otherProps}>
		<a href={href}>{children}</a>
	</li>
);

class ExampleNav extends PureComponent {
	render() {
		return (
			<nav>
				<a href='/page1'>Page 1</a>
				<Dropdown label='More items'>
					<DropdownItem href='/page2'>Page 2</DropdownItem>
					<DropdownItem href='/page3'>Page 3</DropdownItem>
					<DropdownItem href='/page4'>Page 4</DropdownItem>
				</Dropdown>
				<Dropdown label='Even more items'>
					<DropdownItem href='/page5'>Page 5</DropdownItem>
					<DropdownItem href='/page6'>Page 6</DropdownItem>
				</Dropdown>
			</nav>
		);
	}
}

export default ExampleNav;
