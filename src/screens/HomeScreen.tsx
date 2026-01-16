import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Icon name="brain" size={24} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={styles.logoText}>MindEase</Text>
                        <Text style={styles.premiumText}>PREMIUM CARE</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationIcon}>
                    <Icon name="notifications" size={24} color="#FF9B71" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Find your specialist..."
                    placeholderTextColor="#999"
                />
            </View>

            {/* Hero Card */}
            <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>Focus on your{'\n'}mental clarity.</Text>
                <TouchableOpacity style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>New Plans Available</Text>
                </TouchableOpacity>
            </View>

            {/* Service Cards */}
            <View style={styles.servicesGrid}>
                {/* Online Consultation */}
                <View style={[styles.serviceCard, styles.blueCard]}>
                    <View style={styles.serviceIconContainer}>
                        <Icon name="videocam" size={32} color="#5B7FFF" />
                    </View>
                    <Text style={styles.serviceTitle}>Online{'\n'}Consultation</Text>
                    <View style={styles.serviceFooter}>
                        <Text style={styles.serviceSubtitle}>HD VIDEO CALL</Text>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>BOOK</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* In-Clinic Visit */}
                <View style={[styles.serviceCard, styles.greenCard]}>
                    <View style={styles.serviceIconContainer}>
                        <Icon name="medkit" size={32} color="#4ECDC4" />
                    </View>
                    <Text style={styles.serviceTitle}>In-Clinic{'\n'}Visit</Text>
                    <View style={styles.serviceFooter}>
                        <Text style={styles.serviceSubtitle}>PHYSICAL CARE</Text>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>BOOK</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Emergency Support */}
                <View style={[styles.serviceCard, styles.orangeCard]}>
                    <View style={styles.serviceIconContainer}>
                        <Icon name="alert-circle" size={32} color="#FF6B9D" />
                    </View>
                    <Text style={styles.serviceTitle}>EMERGENCY{'\n'}SUPPORT</Text>
                    <View style={styles.serviceFooter}>
                        <Text style={styles.serviceSubtitle}>ACTIVE 24/7</Text>
                        <TouchableOpacity style={[styles.bookButton, styles.urgentButton]}>
                            <Text style={styles.bookButtonText}>URGENT</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Psychiatric Clinic */}
                <View style={[styles.serviceCard, styles.purpleCard]}>
                    <View style={styles.serviceIconContainer}>
                        <Icon name="clipboard" size={32} color="#A78BFA" />
                    </View>
                    <Text style={styles.serviceTitle}>Psychiatric{'\n'}Clinic</Text>
                    <View style={styles.serviceFooter}>
                        <Text style={styles.serviceSubtitle}>SPECIALIZED</Text>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>VIEW</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Top Specialists Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Specialists</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>SEE ALL</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.specialistsList}>
                <View style={styles.specialistCard}>
                    <View style={styles.doctorImageContainer}>
                        <Icon name="person-circle" size={50} color="#4ECDC4" />
                    </View>
                    <Text style={styles.doctorName}>Dr. Sarah John...</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>4.8 • Clinical Psych</Text>
                    </View>
                </View>

                <View style={styles.specialistCard}>
                    <View style={styles.doctorImageContainer}>
                        <Icon name="person-circle" size={50} color="#5B7FFF" />
                    </View>
                    <Text style={styles.doctorName}>Dr. Michael...</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>4.9 • Psychiatrist</Text>
                    </View>
                </View>

                <View style={styles.specialistCard}>
                    <View style={styles.doctorImageContainer}>
                        <Icon name="person-circle" size={50} color="#A78BFA" />
                    </View>
                    <Text style={styles.doctorName}>Dr. Emma...</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>4.7 • Therapist</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Review Section */}
            <View style={styles.reviewCard}>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={16} color="#FFD700" />
                    ))}
                </View>
                <Text style={styles.reviewText}>
                    "Expert care that truly understands the nuances of modern stress."
                </Text>
                <View style={styles.reviewAuthor}>
                    <View style={styles.authorAvatar}>
                        <Text style={styles.avatarText}>AS</Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>ANNA STEVENSON</Text>
                        <Text style={styles.authorLabel}>VERIFIED PATIENT</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Padding */}
            {/* <View style={{ height: 100 }} /> */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 15,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#5B7FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    premiumText: {
        fontSize: 8,
        color: '#999',
        letterSpacing: 0.8,
    },
    notificationIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#000',
        paddingVertical: 0,
    },
    heroCard: {
        backgroundColor: '#1A1F3A',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 16,
        minHeight: 120,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        lineHeight: 28,
    },
    heroButton: {
        backgroundColor: '#5B7FFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    heroButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 16,
        gap: 12,
        justifyContent: 'space-between',
    },
    serviceCard: {
        width: '48%',
        borderRadius: 16,
        padding: 15,
        minHeight: 150,
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    blueCard: {
        backgroundColor: '#E8EFFF',
    },
    greenCard: {
        backgroundColor: '#E0F7F5',
    },
    orangeCard: {
        backgroundColor: '#FFF4E0',
    },
    purpleCard: {
        backgroundColor: '#F3EFFF',
    },
    serviceIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        lineHeight: 20,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceSubtitle: {
        fontSize: 8,
        color: '#666',
        letterSpacing: 0.5,
    },
    bookButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    urgentButton: {
        backgroundColor: '#FF6B9D',
    },
    bookButtonText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#000',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    seeAllText: {
        fontSize: 11,
        color: '#5B7FFF',
        fontWeight: '600',
    },
    specialistsList: {
        paddingLeft: 16,
    },
    specialistCard: {
        width: 130,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    doctorImageContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    doctorName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 10,
        color: '#666',
    },
    reviewCard: {
        backgroundColor: '#F8F8F8',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 10,
    },
    reviewText: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 20,
    },
    reviewAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    authorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8EFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5B7FFF',
    },
    authorName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000',
    },
    authorLabel: {
        fontSize: 9,
        color: '#999',
    },
});

export default HomeScreen;
