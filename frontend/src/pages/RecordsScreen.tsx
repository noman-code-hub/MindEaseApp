import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createResponsiveStyles } from '../utils/responsive';

const { width } = Dimensions.get('window');

interface MedicalRecord {
    id: string;
    type: 'prescription' | 'lab' | 'visit' | 'report';
    title: string;
    doctor: string;
    date: string;
    description: string;
}

// Sample data - will be replaced with API data later
const SAMPLE_RECORDS: MedicalRecord[] = [
    {
        id: '1',
        type: 'prescription',
        title: 'Anxiety Medication',
        doctor: 'Dr. Sarah Ahmed',
        date: '2026-02-10',
        description: 'Prescribed medication for anxiety management'
    },
    {
        id: '2',
        type: 'lab',
        title: 'Blood Test Results',
        doctor: 'Dr. Ali Khan',
        date: '2026-02-08',
        description: 'Complete blood count and thyroid function test'
    },
    {
        id: '3',
        type: 'visit',
        title: 'Consultation Notes',
        doctor: 'Dr. Fatima Malik',
        date: '2026-02-05',
        description: 'Follow-up consultation for stress management'
    },
];

const RecordsScreen = () => {
    const insets = useSafeAreaInsets();
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'prescription' | 'lab' | 'visit' | 'report'>('all');

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'prescription':
                return 'medical-outline';
            case 'lab':
                return 'flask-outline';
            case 'visit':
                return 'clipboard-outline';
            case 'report':
                return 'document-text-outline';
            default:
                return 'document-outline';
        }
    };

    const getRecordColor = (type: string) => {
        switch (type) {
            case 'prescription':
                return '#5B7FFF';
            case 'lab':
                return '#FF6B9D';
            case 'visit':
                return '#4CAF50';
            case 'report':
                return '#FF9800';
            default:
                return '#999';
        }
    };

    const filteredRecords = selectedFilter === 'all' 
        ? SAMPLE_RECORDS 
        : SAMPLE_RECORDS.filter(record => record.type === selectedFilter);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Medical Records</Text>
                        <Text style={styles.headerSubtitle}>Your health history at a glance</Text>
                    </View>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Icon name="download-outline" size={24} color="#5B7FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                <TouchableOpacity
                    style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setSelectedFilter('all')}
                >
                    <Icon 
                        name="grid-outline" 
                        size={18} 
                        color={selectedFilter === 'all' ? '#fff' : '#666'} 
                        style={styles.filterIcon}
                    />
                    <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, selectedFilter === 'prescription' && styles.filterChipActive]}
                    onPress={() => setSelectedFilter('prescription')}
                >
                    <Icon 
                        name="medical-outline" 
                        size={18} 
                        color={selectedFilter === 'prescription' ? '#fff' : '#666'} 
                        style={styles.filterIcon}
                    />
                    <Text style={[styles.filterText, selectedFilter === 'prescription' && styles.filterTextActive]}>
                        Prescriptions
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, selectedFilter === 'lab' && styles.filterChipActive]}
                    onPress={() => setSelectedFilter('lab')}
                >
                    <Icon 
                        name="flask-outline" 
                        size={18} 
                        color={selectedFilter === 'lab' ? '#fff' : '#666'} 
                        style={styles.filterIcon}
                    />
                    <Text style={[styles.filterText, selectedFilter === 'lab' && styles.filterTextActive]}>
                        Lab Results
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, selectedFilter === 'visit' && styles.filterChipActive]}
                    onPress={() => setSelectedFilter('visit')}
                >
                    <Icon 
                        name="clipboard-outline" 
                        size={18} 
                        color={selectedFilter === 'visit' ? '#fff' : '#666'} 
                        style={styles.filterIcon}
                    />
                    <Text style={[styles.filterText, selectedFilter === 'visit' && styles.filterTextActive]}>
                        Visits
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterChip, selectedFilter === 'report' && styles.filterChipActive]}
                    onPress={() => setSelectedFilter('report')}
                >
                    <Icon 
                        name="document-text-outline" 
                        size={18} 
                        color={selectedFilter === 'report' ? '#fff' : '#666'} 
                        style={styles.filterIcon}
                    />
                    <Text style={[styles.filterText, selectedFilter === 'report' && styles.filterTextActive]}>
                        Reports
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Records List */}
            <ScrollView 
                style={styles.recordsList}
                contentContainerStyle={styles.recordsContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                        <TouchableOpacity 
                            key={record.id} 
                            style={styles.recordCard}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.recordIconContainer, { backgroundColor: getRecordColor(record.type) + '15' }]}>
                                <Icon 
                                    name={getRecordIcon(record.type)} 
                                    size={28} 
                                    color={getRecordColor(record.type)} 
                                />
                            </View>
                            
                            <View style={styles.recordInfo}>
                                <Text style={styles.recordTitle}>{record.title}</Text>
                                <View style={styles.recordMeta}>
                                    <Icon name="person-outline" size={14} color="#999" />
                                    <Text style={styles.recordDoctor}>{record.doctor}</Text>
                                </View>
                                <Text style={styles.recordDescription} numberOfLines={2}>
                                    {record.description}
                                </Text>
                                <View style={styles.recordFooter}>
                                    <View style={styles.recordDate}>
                                        <Icon name="calendar-outline" size={14} color="#666" />
                                        <Text style={styles.recordDateText}>{formatDate(record.date)}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.viewButton}>
                                        <Text style={styles.viewButtonText}>View</Text>
                                        <Icon name="chevron-forward" size={16} color="#5B7FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Icon name="folder-open-outline" size={64} color="#DDD" />
                        </View>
                        <Text style={styles.emptyTitle}>No Records Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedFilter === 'all' 
                                ? 'Your medical records will appear here' 
                                : `No ${selectedFilter} records available`}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = createResponsiveStyles({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FD',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
        fontWeight: '400',
    },
    headerIconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    filterChipActive: {
        backgroundColor: '#5B7FFF',
    },
    filterIcon: {
        marginRight: 6,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    recordsList: {
        flex: 1,
    },
    recordsContent: {
        padding: 20,
    },
    recordCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recordIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    recordInfo: {
        flex: 1,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    recordMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    recordDoctor: {
        fontSize: 13,
        color: '#999',
        marginLeft: 4,
    },
    recordDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 12,
    },
    recordFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recordDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordDateText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F0F4FF',
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5B7FFF',
        marginRight: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default RecordsScreen;
