import Link from 'next/link'
import Header from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Camera,
    Mic,
    Zap,
    ShieldCheck,
    Users,
    Building2,
    Truck,
    Droplets,
    Trash2,
    ArrowRight,
    CheckCircle2,
    MessageSquare
} from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-12">

                {/* Hero Section */}
                <section className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0B3C5D] mb-6">
                        About <span className="text-[#0F4C81]">UnityDesk</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Empowering citizens of Manipur with AI-driven civic issue reporting.
                        Fast, efficient, and transparent grievance management.
                    </p>
                </section>

                {/* Mission Statement */}
                <section className="mb-16">
                    <Card className="border-[#0F4C81]/20 bg-gradient-to-br from-[#0B3C5D] to-[#1A5F7A] text-white overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <p className="text-lg text-blue-100 leading-relaxed">
                                UnityDesk bridges the gap between citizens and government departments through
                                intelligent AI-powered complaint routing. We believe every citizen deserves
                                to have their voice heard and their issues resolved quickly and transparently.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* How It Works */}
                <section className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-[#0B3C5D]">How It Works</h2>
                        <div className="w-20 h-1 bg-[#2B8FBD] mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Camera className="h-8 w-8 text-[#0F4C81]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#0B3C5D]">1. Capture</h3>
                                <p className="text-gray-600">
                                    Take a photo or upload images of the civic issue you want to report.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap className="h-8 w-8 text-[#0F4C81]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#0B3C5D]">2. AI Analysis</h3>
                                <p className="text-gray-600">
                                    Our AI analyzes your submission and routes it to the correct department.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="h-8 w-8 text-[#0F4C81]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#0B3C5D]">3. Track</h3>
                                <p className="text-gray-600">
                                    Receive real-time updates as your complaint is processed and resolved.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Multi-Input Support */}
                <section className="mb-16">
                    <Card className="border-blue-100">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-[#0B3C5D] mb-6">Multiple Ways to Report</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                    <Camera className="h-8 w-8 text-[#0F4C81]" />
                                    <div>
                                        <h4 className="font-bold text-[#0B3C5D]">Photos</h4>
                                        <p className="text-sm text-gray-600">Upload evidence images</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                    <Mic className="h-8 w-8 text-[#0F4C81]" />
                                    <div>
                                        <h4 className="font-bold text-[#0B3C5D]">Voice</h4>
                                        <p className="text-sm text-gray-600">Record voice messages</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                    <MessageSquare className="h-8 w-8 text-[#0F4C81]" />
                                    <div>
                                        <h4 className="font-bold text-[#0B3C5D]">Text</h4>
                                        <p className="text-sm text-gray-600">Type your complaint</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Departments */}
                <section className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-[#0B3C5D]">Department Categories</h2>
                        <p className="text-gray-600 mt-2">
                            Your complaint is automatically routed to the right department
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Building2, name: 'PWD', desc: 'Roads & Buildings' },
                            { icon: Droplets, name: 'PHED', desc: 'Water Supply' },
                            { icon: Zap, name: 'Electricity', desc: 'Power Issues' },
                            { icon: Trash2, name: 'Municipal', desc: 'Sanitation' },
                            { icon: Truck, name: 'Transport', desc: 'Traffic & Transport' },
                            { icon: ShieldCheck, name: 'Police', desc: 'Law & Order' },
                            { icon: Users, name: 'Health', desc: 'Healthcare' },
                            { icon: Building2, name: 'Revenue', desc: 'Land & Taxes' },
                        ].map((dept, i) => (
                            <Card key={i} className="border-blue-100 hover:border-[#0F4C81] transition-colors cursor-default">
                                <CardContent className="p-4 text-center">
                                    <dept.icon className="h-8 w-8 text-[#0F4C81] mx-auto mb-2" />
                                    <h4 className="font-bold text-[#0B3C5D]">{dept.name}</h4>
                                    <p className="text-xs text-gray-500">{dept.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Benefits */}
                <section className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-[#0B3C5D]">Why Choose UnityDesk?</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            'AI-powered automatic complaint classification',
                            'Real-time status tracking and notifications',
                            'Transparent communication with government officers',
                            'Support for multiple languages including Manipuri',
                            'Secure and encrypted data handling',
                            'Fast response times with priority routing',
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Officer CTA */}
                <section className="mb-16">
                    <Card className="border-blue-100 bg-gray-50">
                        <CardContent className="p-8 text-center">
                            <Users className="h-12 w-12 text-[#2B8FBD] mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-4 text-[#0B3C5D]">Are you a Government Officer?</h2>
                            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                                Access your department's dashboard to manage grievances, update statuses,
                                and communicate with citizens efficiently.
                            </p>
                            <Button asChild variant="outline" className="border-[#0F4C81] text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white px-8 py-6 rounded-xl font-bold">
                                <Link href="/login">Officer Dashboard</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* Main CTA */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold text-[#0B3C5D] mb-4">Ready to Report an Issue?</h2>
                    <p className="text-gray-600 mb-6">
                        Take a photo and let our AI handle the rest.
                    </p>
                    <Button asChild className="bg-[#0F4C81] hover:bg-[#0B3C5D] text-white px-8 py-6 rounded-xl font-bold text-lg">
                        <Link href="/">
                            Report a Complaint
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-[#0B3C5D] text-white py-8 mt-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-blue-200 mb-2">© 2026 UnityDesk - Unified Grievance System</p>
                    <p className="text-sm text-blue-300">
                        Built with ❤️ for better civic engagement
                    </p>
                </div>
            </footer>
        </div>
    )
}
