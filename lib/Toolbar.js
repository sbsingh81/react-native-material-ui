import Menu from './Menu/Menu';
import React, { Component, PropTypes, StyleSheet, View, Text, TextInput } from 'react-native';
import { TYPO, PRIMARY, THEME_NAME, PRIMARY_COLORS } from './config';
import { getColor } from './helpers';
import Icon from './Icon';
import IconToggle from './IconToggle';
import isFunction from './utils';

const MenuItem = Menu.Item;

export default class Toolbar extends Component {

    static propTypes = {
        title: PropTypes.string,
        theme: PropTypes.oneOf(THEME_NAME),
        primary: PropTypes.oneOf(PRIMARY_COLORS),
        style: PropTypes.object,
        leftIconStyle: PropTypes.object,
        rightIconStyle: PropTypes.object,
        elevation: PropTypes.number,
        overrides: PropTypes.shape({
            backgroundColor: PropTypes.string,
            titleColor: PropTypes.string,
            leftIconColor: PropTypes.string,
            rightIconColor: PropTypes.string
        }),
        icon: PropTypes.string,
        onIconPress: PropTypes.func,
        actions: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string.isRequired,
            onPress: PropTypes.func,
            counter: PropTypes.shape()
        })),
        menuActions: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string,
            onPress: PropTypes.func,
            label: PropTypes.string,
            value: PropTypes.object
        })),
        searchable: PropTypes.shape({
            onChangeText: PropTypes.func,
            onSearchClosed: PropTypes.func,
            placeholder: PropTypes.string
        })

    };

    static defaultProps = {
        theme: 'dark',
        primary: PRIMARY,
        elevation: 4
    };

    constructor(props){
        super(props);

        this.state = {
            isSearchActive: false,
            searchValue: ''
        }
    }



    render() {
        const {
            title,
            theme,
            primary,
            style,
            leftIconStyle,
            rightIconStyle,
            elevation,
            overrides,
            icon,
            onIconPress,
            actions ,
            menuActions,
            searchable
        } = this.props;

        const themeMap = {
            light: {
                backgroundColor: '#ffffff',
                color: 'rgba(0,0,0,.87)',
                leftIconColor: 'rgba(0,0,0,.54)',
                rightIconColor: 'rgba(0,0,0,.54)'
            },
            dark: {
                backgroundColor: getColor(primary),
                color: 'rgba(255,255,255,.87)',
                leftIconColor: 'rgba(255,255,255,.87)',
                rightIconColor: 'rgba(255,255,255,.87)'
            }
        };

        const opacityMap = {
            light: .38,
            dark: .30
        };

        const styleMap = {
            backgroundColor: overrides && overrides.backgroundColor ? getColor(overrides.backgroundColor) : themeMap[theme].backgroundColor,
            color: overrides && overrides.color ? getColor(overrides.color) : themeMap[theme].color,
            leftIconColor: overrides && overrides.leftIconColor ? getColor(overrides.leftIconColor) : themeMap[theme].leftIconColor,
            rightIconColor: overrides && overrides.rightIconColor ? getColor(overrides.rightIconColor) : themeMap[theme].rightIconColor
        };

        let iconMap = icon;
        let onIconPressMap = onIconPress;
        let actionsMap = actions;
        let menuActionsMap = menuActions;

        if(this.state.isSearchActive){
            iconMap = 'keyboard-backspace';
            onIconPressMap = this._onSearchClosePressed;
            styleMap.backgroundColor = getColor('paperGrey100');
            styleMap.color = themeMap.light.color;
            styleMap.leftIconColor = themeMap.light.leftIconColor;
            styleMap.rightIconColor = themeMap.light.rightIconColor;
            actionsMap = [{
                icon: 'clear',
                onPress: () => this._onSearchTextChanged('')
            }]
            menuActionsMap = null;
        }

        return (
            <View style={[styles.toolbar, { backgroundColor :styleMap.backgroundColor, elevation }, style]}>
                {
                    iconMap && (
                        <IconToggle
                            color={styleMap.leftIconColor}
                            onPress={onIconPressMap}
                        >
                            <Icon name={iconMap || 'menu'}
                                  size={24}
                                  color={styleMap.leftIconColor}
                                  style={[styles.leftIcon, leftIconStyle]}
                            />
                        </IconToggle>
                    )
                }
                {
                    !this.state.isSearchActive &&
                    <Text
                        numberOfLines={1}
                        style={[styles.title, TYPO.paperFontTitle, {
                            color: styleMap.color,
                            marginLeft: iconMap ? styles.title.marginLeft : 16
                        }]}
                    >
                        {title}
                    </Text>
                }
                {
                    this.state.isSearchActive &&
                    <TextInput
                        autoFocus={true}
                        onChangeText={this._onSearchTextChanged}
                        placeholder={searchable.placeholder}
                        style={[styles.title, TYPO.paperFontTitle, {
                            fontWeight: 'normal',
                            color: styleMap.color,
                            marginLeft: iconMap ? styles.title.marginLeft : 16
                        }]}
                        underlineColorAndroid='transparent'
                        value={this.state.searchValue}
                    />
                }
                {
                    actionsMap &&
                    actionsMap.map((action, i) => {
                        return (
                            <IconToggle
                                key={i}
                                color={styleMap.rightIconColor}
                                badge={action.badge}
                                onPress={action.onPress}
                                disabled={action.disabled}
                            >
                                <Icon name={action.icon}
                                      size={24}
                                      color={styleMap.rightIconColor}
                                      style={[styles.rightIcon, rightIconStyle, action.disabled ? { opacity: opacityMap[theme] } : null]}
                                />
                            </IconToggle>
                        );
                    })
                }
                {
                    searchable && !this.state.isSearchActive &&
                    <IconToggle
                        color={styleMap.rightIconColor}
                        onPress={() => this._onSearchPressed()}
                    >
                        <Icon name={'search'}
                              color={styleMap.rightIconColor}
                              size={24}
                              style={[styles.rightIcon, rightIconStyle]}
                        />
                    </IconToggle>
                }
                {
                    menuActionsMap &&
                    <IconToggle
                        color={styleMap.rightIconColor}
                        key={'menu'}
                        onPress={() => this._onMenuPressed()}
                    >
                        <Icon name={'more-vert'}
                              color={styleMap.rightIconColor}
                              ref='menuTrigger'
                              size={24}
                              style={[styles.rightIcon, rightIconStyle]}
                        />
                    </IconToggle>
                }
                {
                    menuActionsMap &&
                    <Menu ref='menu'>
                        {
                            menuActions.map((action, i) => {
                                return (
                                    <MenuItem
                                        key={i}
                                        label={action.label}
                                        onPress={action.onPress}
                                        value={action.value}
                                    />
                                );
                            })
                        }
                    </Menu>
                }
            </View>
        );
    }

    _onMenuPressed = () => {
        if(this.refs.menu){
            this.refs.menu.toggle(this.refs.menuTrigger)
        }
    };
    _onSearchTextChanged = (value) => {
        const { searchable } = this.props;

        if(isFunction(searchable.onChangeText)){
            searchable.onChangeText(value);
        }

        this.setState({ searchValue: value })
    };
    _onSearchPressed = () => {
        this.setState({
            isSearchActive: true,
            searchValue: ''
        })
    };
    _onSearchClosePressed = () => {
        const { searchable } = this.props;

        if(isFunction(searchable.onSearchClosed)){
            searchable.onSearchClosed();
        }

        this.setState({
            isSearchActive: false,
            searchValue: ''
        })
    };
}

const styles = StyleSheet.create({
    toolbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        flex: 1,
        marginLeft: 16
    },
    leftIcon: {
        margin: 16
    },
    rightIcon: {
        margin: 16
    }
});
