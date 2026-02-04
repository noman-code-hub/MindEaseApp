import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import MapView, { Marker, Region, MapPressEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Default region set to Pakistan
const INITIAL_REGION: Region = {
    latitude: 30.3753,
    longitude: 69.3451,
    latitudeDelta: 15,
    longitudeDelta: 15,
};

const SelectLocationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const mapRef = useRef<MapView>(null);

    const [selectedLocation, setSelectedLocation] = useState({
        latitude: 30.3753,
        longitude: 69.3451,
    });

    const [region, setRegion] = useState<Region>(INITIAL_REGION);
    const [isLocationSelected, setIsLocationSelected] = useState(false);

    // Handle place selection from search
    const handlePlaceSelect = (data: any, details: any = null) => {
        if (details) {
            const { lat, lng } = details.geometry.location;
            const newCoords = { latitude: lat, longitude: lng };

            setSelectedLocation(newCoords);
            setIsLocationSelected(true);

            const newRegion = {
                ...newCoords,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };

            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
        }
    };

    // Handle map tap to update marker
    const handleMapPress = (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;
        setSelectedLocation(coords);
        setIsLocationSelected(true);
    };

    // Handle marker drag
    const handleMarkerDragEnd = (e: MarkerDragStartEndEvent) => {
        setSelectedLocation(e.nativeEvent.coordinate);
    };

    const handleSave = () => {
        if (route.params?.onSelect) {
            route.params.onSelect(selectedLocation);
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1A1F3A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Clinic Location</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.mapContainer}>
                <View style={StyleSheet.absoluteFill}>
                    <View style={{ flex: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#999' }}>Map Loading... (Requires Google API Key)</Text>
                    </View>
                </View>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={INITIAL_REGION}
                    onPress={handleMapPress}
                    provider="google"
                >
                    {isLocationSelected && (
                        <Marker
                            draggable
                            coordinate={selectedLocation}
                            onDragEnd={handleMarkerDragEnd}
                            title="Clinic Location"
                            description="Drag me to fine-tune"
                        />
                    )}
                </MapView>

                {/* Search Bar - Positioned over map */}
                <View style={styles.searchContainer}>
                    <GooglePlacesAutocomplete
                        placeholder="Search clinic or area..."
                        fetchDetails={true}
                        onPress={handlePlaceSelect}
                        query={{
                            key: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
                            language: 'en',
                            components: 'country:pk', // Restricted to Pakistan
                        }}
                        styles={{
                            container: { flex: 0 },
                            textInput: styles.searchInput,
                            listView: styles.searchListView,
                        }}
                        enablePoweredByContainer={false}
                        nearbyPlacesAPI="GooglePlacesSearch"
                        debounce={400}
                    />
                </View>

                {/* Real-time coordinates display */}
                {isLocationSelected && (
                    <View style={styles.coordDisplay}>
                        <View style={styles.coordItem}>
                            <Text style={styles.coordLabel}>Latitude</Text>
                            <Text style={styles.coordValue}>{selectedLocation.latitude.toFixed(6)}</Text>
                        </View>
                        <View style={styles.coordDivider} />
                        <View style={styles.coordItem}>
                            <Text style={styles.coordLabel}>Longitude</Text>
                            <Text style={styles.coordValue}>{selectedLocation.longitude.toFixed(6)}</Text>
                        </View>
                    </View>
                )}

                {/* Action Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            !isLocationSelected && styles.saveButtonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={!isLocationSelected}
                    >
                        <Text style={styles.saveButtonText}>Save Clinic Location</Text>
                    </TouchableOpacity>
                    <Text style={styles.instructionText}>
                        Search or tap on map to pick location. Drag marker to adjust.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    searchInput: {
        height: 50,
        color: '#333',
        fontSize: 16,
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    searchListView: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    coordDisplay: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(26, 31, 58, 0.9)',
        borderRadius: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    coordItem: {
        alignItems: 'center',
    },
    coordLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    coordValue: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    coordDivider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: 30,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    saveButton: {
        backgroundColor: '#5B7FFF',
        height: 55,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    instructionText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 12,
    },
});

export default SelectLocationScreen;
