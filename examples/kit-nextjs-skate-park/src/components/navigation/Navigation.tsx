'use client';
import React, { useState, useEffect, JSX } from 'react';
import { Link, LinkField, Text, TextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import NextLink from 'next/link';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Id: string;
  DisplayName: string;
  Title: TextField;
  NavigationTitle: TextField;
  Href: string;
  Querystring: string;
  Children: Array<Fields>;
  Styles: string[];
}

interface NavigationListItemProps {
  fields: Fields;
  handleClick: (event?: React.MouseEvent<HTMLElement>) => void;
  relativeLevel: number;
  currentPath?: string;
}

interface NavigationProps extends ComponentProps {
  fields: Fields;
}

const getTextContent = (fields: Fields): JSX.Element | string => {
  if (fields.NavigationTitle) return <Text field={fields.NavigationTitle} />;
  if (fields.Title) return <Text field={fields.Title} />;
  return fields.DisplayName;
};

const getLinkField = (fields: Fields): LinkField => ({
  value: {
    href: fields.Href,
    title:
      fields.NavigationTitle?.value?.toString() ??
      fields.Title?.value?.toString() ??
      fields.DisplayName,
    querystring: fields.Querystring,
  },
});

const NavigationListItem: React.FC<NavigationListItemProps> = ({
  fields,
  handleClick,
  relativeLevel,
  currentPath,
}) => {
  const [isActive, setIsActive] = useState(false);
  const { page } = useSitecore();

  const classNames = [...fields.Styles, `rel-level${relativeLevel}`, isActive ? 'active' : ''].join(
    ' '
  );

  const hasChildren = fields.Children?.length > 0;
  const isCurrentPage = currentPath && fields.Href === currentPath;
  
  const children = hasChildren
    ? fields.Children.map((fields, index) => (
        <NavigationListItem
          key={`${index}-${fields.Id}`}
          fields={fields}
          handleClick={handleClick}
          relativeLevel={relativeLevel + 1}
          currentPath={currentPath}
        />
      ))
    : null;

  const linkField = getLinkField(fields);
  const href = linkField.value.href || '#';
  const querystring = linkField.value.querystring || '';
  const fullHref = querystring ? `${href}${href.includes('?') ? '&' : '?'}${querystring}` : href;

  return (
    <li className={classNames} key={fields.Id}>
      <div
        className={`navigation-title ${hasChildren ? 'child' : ''}`}
        onClick={() => setIsActive(!isActive)}
      >
        {page.mode.isEditing ? (
          <Link 
            field={linkField} 
            editable={true} 
            onClick={handleClick}
            {...(isCurrentPage && { 'aria-current': 'page' })}
          >
            {getTextContent(fields)}
          </Link>
        ) : (
          <NextLink 
            href={fullHref}
            onClick={handleClick}
            {...(isCurrentPage && { 'aria-current': 'page' })}
          >
            {getTextContent(fields)}
          </NextLink>
        )}
      </div>
      {hasChildren && <ul className="clearfix">{children}</ul>}
    </li>
  );
};

export const Default = ({ params, fields }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const { page } = useSitecore();
  const { styles, RenderingIdentifier: id } = params;
  const menuId = `nav-menu-${id || 'main'}`;

  // Get current path on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  if (!Object.values(fields).length) {
    return (
      <div className={`component navigation ${styles}`} id={id}>
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  const handleToggleMenu = (event?: React.MouseEvent<HTMLElement>, forceState?: boolean) => {
    if (event && page.mode.isEditing) {
      event.preventDefault();
    }

    setIsMenuOpen(forceState ?? !isMenuOpen);
  };

  const navigationItems = Object.values(fields)
    .filter(Boolean)
    .map((item: Fields, index) => (
      <NavigationListItem
        key={`${index}-${item.Id}`}
        fields={item}
        handleClick={(event) => handleToggleMenu(event, false)}
        relativeLevel={1}
        currentPath={currentPath}
      />
    ));

  return (
    <div className={`component navigation ${styles}`} id={id}>
      <label 
        className="menu-mobile-navigate-wrapper"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
      >
        <input
          type="checkbox"
          className="menu-mobile-navigate"
          checked={isMenuOpen}
          onChange={() => handleToggleMenu()}
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="menu-humburger" aria-hidden="true" />
      </label>
      <div className="component-content">
        <nav id={menuId} aria-label="Main navigation">
          <ul className="clearfix">{navigationItems}</ul>
        </nav>
      </div>
    </div>
  );
};

