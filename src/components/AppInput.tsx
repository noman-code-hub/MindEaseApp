import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    StyleProp,
    ViewStyle,
    TextStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface AppInputProps extends TextInputProps {
    label?: string;
    icon?: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const AppInput = forwardRef<TextInput, AppInputProps>(({
    label,
    icon,
    error,
    containerStyle,
    inputStyle,
    leftElement,
    rightElement,
    multiline,
    ...props
}, ref) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputWrapper,
                leftElement ? { paddingLeft: 0 } : null,
                multiline && styles.multilineWrapper,
                error ? styles.errorBorder : null
            ]}>
                {leftElement}
                {icon && !leftElement && (
                    <Icon name={icon} size={20} color="#666" style={styles.icon} />
                )}
                <TextInput
                    ref={ref}
                    style={[
                        styles.input,
                        leftElement ? { paddingLeft: 12 } : null,
                        multiline && styles.multilineInput,
                        inputStyle
                    ]}
                    placeholderTextColor="#999"
                    multiline={multiline}
                    {...props}
                />
                {rightElement}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        backgroundColor: '#FCFCFD',
        paddingHorizontal: 12,
        height: 52,
    },
    multilineWrapper: {
        height: undefined,
        minHeight: 100,
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        paddingVertical: 6,
    },
    multilineInput: {
        textAlignVertical: 'top',
        minHeight: 80,
    },
    errorBorder: {
        borderColor: '#FF5B5B',
    },
    errorText: {
        color: '#FF5B5B',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default AppInput;
