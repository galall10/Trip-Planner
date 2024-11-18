"use client"
import styles from '../styles/Sidebar.module.css';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const Sidebar = () => {
    const router = useRouter();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserId(user._id);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/home');
    };

    return (
        <nav className={styles.sidebar}>
            <div className={styles.img}>
            <img
                src="/logos/purb logo/right logo.png"
                alt="Tripster Logo"
                width={250}
                height={100}
            />
            </div>
            <ul>
                <li>
                    <Link href="/main">
                        <button>
                            <img src="/black-icons/home.png" alt="Home" width={24} height={24} />
                            <span>Home</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/post">
                        <button>
                            <img src="/black-icons/post.png" alt="Post" width={24} height={24} />
                            <span>Post</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/Search">
                        <button>
                            <img src="/black-icons/discover.png" alt="Search" width={24} height={24} />
                            <span>Discover</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/Go">
                        <button>
                            <img src="/black-icons/go.png" alt="Go!" width={24} height={24} />
                            <span>Go!</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href={userId ? `/profile?userId=${userId}` : '/profile'}>
                        <button>
                            <img src="/black-icons/profile.png" alt="Profile" width={24} height={24} />
                            <span>Profile</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/settings">
                        <button>
                            <img src="/black-icons/setting.png" alt="Settings" width={24} height={24} />
                            <span>Settings</span>
                        </button>
                    </Link>
                </li>
                <li>
                    <button onClick={handleLogout}>
                        <img src="/black-icons/logout.png" alt="Log out" width={24} height={24} />
                        <span>Log out</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
